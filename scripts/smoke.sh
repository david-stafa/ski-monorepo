#!/usr/bin/env bash
#
# Backend smoke test — exercises every tRPC route against the running dev API
# and asserts the important invariants (no overlapping bookings, cancel frees
# gear, retired/booked items behave, validation rejects bad input).
#
# It only CREATES data; run scripts/cleanup.sh afterwards to wipe.
#
# Usage:  ./scripts/smoke.sh            (defaults to http://localhost:3001/api/trpc)
#         BASE=http://host/api/trpc ./scripts/smoke.sh
#
set -uo pipefail
BASE="${BASE:-http://localhost:3001/api/trpc}"
PASS=0 FAIL=0

grn(){ printf '\033[32m%s\033[0m' "$*"; }
red(){ printf '\033[31m%s\033[0m' "$*"; }
dim(){ printf '\033[2m%s\033[0m' "$*"; }
section(){ printf '\n\033[1m%s\033[0m\n' "$*"; }

enc(){ python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$1"; }

# The API runs a superjson transformer, so payloads must be wrapped as
# {"json":…,"meta":…} and every ISO timestamp tagged as a Date — otherwise
# z.date() receives a plain string and rejects it. Tagging is by autodetect, so
# new date fields at any depth are handled without touching this helper.
sj(){ printf '%s' "$1" | python3 -c 'import sys,json,re
ISO=re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$")
d=json.load(sys.stdin); vals={}
def walk(n,p):
    if isinstance(n,dict):
        for k,v in n.items(): walk(v,p+[k])
    elif isinstance(n,list):
        for i,v in enumerate(n): walk(v,p+[str(i)])
    elif isinstance(n,str) and ISO.match(n): vals[".".join(p)]=["Date"]
walk(d,[])
out={"json":d}
if vals: out["meta"]={"values":vals}
print(json.dumps(out))'; }

qy(){ curl -s "$BASE/$1?input=$(enc "$(sj "$2")")"; }                                     # query (GET)
mu(){ curl -s -X POST "$BASE/$1" -H 'content-type: application/json' -d "$(sj "$2")"; }   # mutation (POST)

# outcome <resp> -> "OK" | "ERR:<CODE>" | "PARSE_ERR"
outcome(){ printf '%s' "$1" | python3 -c 'import sys,json
try: d=json.load(sys.stdin)
except Exception: print("PARSE_ERR"); sys.exit()
if "error" not in d: print("OK"); sys.exit()
e=d["error"]
e=e.get("json",e)                      # superjson wraps the error payload too
print("ERR:"+str(e.get("data",{}).get("code","?")))'; }

# check <label> <resp> <expected: OK|CONFLICT|NOT_FOUND|BAD_REQUEST>
check(){ local got; got=$(outcome "$2")
  if [ "$3" = "$got" ] || [ "ERR:$3" = "$got" ]
    then PASS=$((PASS+1)); printf '  %s %s\n' "$(grn ✓)" "$1"
    else FAIL=$((FAIL+1)); printf '  %s %s %s\n' "$(red ✗)" "$1" "$(dim "(want $3, got $got)")"; fi; }

# assert <label> <actual> <expected>  (for non-request checks)
assert(){ if [ "$2" = "$3" ]
    then PASS=$((PASS+1)); printf '  %s %s\n' "$(grn ✓)" "$1"
    else FAIL=$((FAIL+1)); printf '  %s %s %s\n' "$(red ✗)" "$1" "$(dim "(want $3, got $2)")"; fi; }

# field <resp> <keys...> -> nested result.data value
field(){ local r="$1"; shift; printf '%s' "$r" | python3 -c 'import sys,json
d=json.load(sys.stdin)["result"]["data"]
d=d.get("json",d)                      # unwrap superjson
for k in sys.argv[1:]: d=d[int(k)] if k.lstrip("-+").isdigit() else d[k]
print(d)' "$@"; }

# contains_id <list-resp> <id> -> "yes"|"no"
contains_id(){ printf '%s' "$1" | python3 -c 'import sys,json
d=json.load(sys.stdin)["result"]["data"]
d=d.get("json",d)
print("yes" if any(x["id"]==sys.argv[1] for x in d) else "no")' "$2"; }

# ---- reservation body builders ----
# `equipment` is a record with one slot per equipment type, not a list — the
# slot named by <type> gets the id, every other slot is null.
slot(){ if [ "$1" = "$2" ]; then printf '"%s"' "$3"; else printf 'null'; fi; }   # slot <slot> <wanted> <id>
equipment(){ printf '{"SKI":%s,"SKI_BOOT":%s,"SNOWBOARD":%s,"SNOWBOARD_BOOT":%s,"HELMET":%s}' \
  "$(slot SKI "$1" "$2")" "$(slot SKI_BOOT "$1" "$2")" "$(slot SNOWBOARD "$1" "$2")" \
  "$(slot SNOWBOARD_BOOT "$1" "$2")" "$(slot HELMET "$1" "$2")"; }               # equipment <type> <id>

# person <name> <equipmentItemId> [type=SKI]   — name must be >= 2 chars.
# `level` and `note` are nullable but still REQUIRED keys, so they must be sent.
person(){ printf '{"name":"%s","weight":75,"height":180,"age":30,"gender":"MALE","poles":null,"level":"INTERMEDIATE","note":null,"backProtection":false,"skiCover":false,"bootCover":false,"goggles":false,"equipment":%s}' "$1" "$(equipment "${3:-SKI}" "$2")"; }
resv(){ printf '{"name":"%s","phoneNumber":"+420123456789","note":null,"startDate":"%s","endDate":"%s","people":[%s]}' "$1" "$2" "$3" "$4"; }
ski_update(){ printf '{"id":"%s","brand":"SmokeTest","model":"%s","length":%s,"isVIP":false}' "$1" "$2" "$3"; }
fa(){ printf '{"type":"%s","startDate":"%s","endDate":"%s"}' "$1" "$2" "$3"; }         # findAvailable input
avail(){ qy equipment.equipmentItem.findAvailable "$(fa "$1" "$2" "$3")"; }            # avail <type> <start> <end>

# Raw windows for the DB-level overlap rule (half-open: start < reqEnd AND
# end > reqStart). W2 is back-to-back with W1 (start == W1 end); W3 overlaps W1.
# These are NOT form-shaped — see the day-boundary section further down for the
# convention the UI actually sends.
W1S=2027-06-01T00:00:00.000Z; W1E=2027-06-08T00:00:00.000Z
W2S=2027-06-08T00:00:00.000Z; W2E=2027-06-15T00:00:00.000Z
W3S=2027-06-04T00:00:00.000Z; W3E=2027-06-11T00:00:00.000Z

# The reservation form sends inclusive whole days: startDate = startOfDay(pickup
# day), endDate = endOfDay(return day). Gear is therefore held for the whole
# return day and frees up the next morning.
S(){ printf '%sT00:00:00.000Z' "$1"; }   # startOfDay — pickup day
E(){ printf '%sT23:59:59.999Z' "$1"; }   # endOfDay   — return day

printf '\033[1mSmoke test → %s\033[0m\n' "$BASE"
if ! curl -sf -o /dev/null "$BASE/equipment.ski.list?input=$(enc "$(sj '{}')")"; then
  printf '%s API not reachable at %s — is the dev server up?\n' "$(red ✗)" "$BASE"; exit 1
fi

# ------------------------------------------------------------------ equipment
section "Equipment · create (all 5 types + edge cases)"
SKI=$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-01","length":170,"isVIP":false}');            check "create ski"           "$SKI" OK
SKI2=$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-02","length":175,"isVIP":true}');            check "create ski #2"        "$SKI2" OK
BOOT=$(mu equipment.skiBoot.create '{"brand":"SmokeTest","model":"Boot-01","length":28}');                     check "create skiBoot"       "$BOOT" OK
BOARD=$(mu equipment.snowboard.create '{"brand":"SmokeTest","model":"Board-01","length":155}');                check "create snowboard"     "$BOARD" OK
SBOOT=$(mu equipment.snowboardBoot.create '{"brand":"SmokeTest","model":"SBoot-01","length":27,"isBoa":true}');check "create snowboardBoot" "$SBOOT" OK
HELM=$(mu equipment.helmet.create '{"name":"SmokeTest Helmet","size":"M","color":"black","description":null,"withIntegratedGoggles":false}'); check "create helmet" "$HELM" OK
check "create ski w/ 1-char model → BAD_REQUEST" "$(mu equipment.ski.create '{"brand":"X","model":"A","length":170,"isVIP":false}')" BAD_REQUEST
check "create ski w/ length<50 → BAD_REQUEST"    "$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Tiny","length":10,"isVIP":false}')" BAD_REQUEST

SKI_ID=$(field "$SKI" id)
SKI_EQ=$(field "$SKI" equipmentItem id)
SKI2_EQ=$(field "$SKI2" equipmentItem id)
BOOT_EQ=$(field "$BOOT" equipmentItem id)

section "Equipment · list"
for t in ski skiBoot snowboard snowboardBoot helmet; do check "list $t" "$(qy equipment.$t.list '{}')" OK; done

section "Equipment · update"
check "update ski"                 "$(mu equipment.ski.update "$(ski_update "$SKI_ID" Ski-01-edit 171)")" OK
check "update missing → NOT_FOUND" "$(mu equipment.ski.update '{"id":"nope","brand":"SmokeTest","model":"Nope","length":170,"isVIP":false}')" NOT_FOUND

section "Availability"
check "findAvailable ski"                    "$(avail SKI "$W1S" "$W1E")" OK
assert "new ski appears in findAvailable"    "$(contains_id "$(avail SKI "$W1S" "$W1E")" "$SKI_EQ")" yes

# --------------------------------------------------------------- reservations
section "Reservation · overlap rules (the crown jewel)"
R1=$(mu reservation.create "$(resv "Smoke A" "$W1S" "$W1E" "$(person Alice "$SKI_EQ")")"); check "book ski (W1)" "$R1" OK
R1_ID=$(field "$R1" reservation id)
check "OVERLAPPING booking same ski → CONFLICT"  "$(mu reservation.create "$(resv "Overlap" "$W3S" "$W3E" "$(person Bob "$SKI_EQ")")")" CONFLICT
check "BACK-TO-BACK booking same ski → OK"       "$(mu reservation.create "$(resv "Adjacent" "$W2S" "$W2E" "$(person Cara "$SKI_EQ")")")" OK
assert "booked ski gone from findAvailable (W1)" "$(contains_id "$(avail SKI "$W1S" "$W1E")" "$SKI_EQ")" no

section "Reservation · get / list"
check "get reservation"             "$(qy reservation.get "{\"id\":\"$R1_ID\"}")" OK
check "get missing → NOT_FOUND"     "$(qy reservation.get '{"id":"nope"}')" NOT_FOUND
check "list reservations"           "$(qy reservation.list '{}')" OK

section "Equipment · delete rules"
check "delete BOOKED ski → CONFLICT" "$(mu equipment.equipmentItem.delete "{\"id\":\"$SKI_EQ\"}")" CONFLICT
FREE=$(mu equipment.helmet.create '{"name":"DeleteMe","size":"L","color":"red","description":null,"withIntegratedGoggles":true}')
check "delete UNBOOKED helmet → OK"  "$(mu equipment.equipmentItem.delete "{\"id\":\"$(field "$FREE" equipmentItem id)\"}")" OK

section "Equipment · retire / unretire"
check "retire skiBoot"                        "$(mu equipment.equipmentItem.retire "{\"id\":\"$BOOT_EQ\"}")" OK
assert "retired skiBoot hidden from findAvailable" "$(contains_id "$(avail SKI_BOOT "$W1S" "$W1E")" "$BOOT_EQ")" no
check "unretire skiBoot"                      "$(mu equipment.equipmentItem.unretire "{\"id\":\"$BOOT_EQ\"}")" OK
assert "unretired skiBoot back in findAvailable"   "$(contains_id "$(avail SKI_BOOT "$W1S" "$W1E")" "$BOOT_EQ")" yes

section "Reservation · cancel frees gear"
R2=$(mu reservation.create "$(resv "CancelTest" "$W1S" "$W1E" "$(person Dan "$SKI2_EQ")")"); check "book ski#2" "$R2" OK
check "double-book ski#2 → CONFLICT"      "$(mu reservation.create "$(resv "Dup" "$W1S" "$W1E" "$(person Eve "$SKI2_EQ")")")" CONFLICT
check "cancel reservation"                "$(mu reservation.cancel "{\"id\":\"$(field "$R2" reservation id)\"}")" OK
check "rebook ski#2 after cancel → OK"     "$(mu reservation.create "$(resv "Refreed" "$W1S" "$W1E" "$(person Finn "$SKI2_EQ")")")" OK

section "Person · cancel frees only that person's gear"
SA=$(field "$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-03","length":170,"isVIP":false}')" equipmentItem id)
SB=$(field "$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-04","length":170,"isVIP":false}')" equipmentItem id)
R3=$(mu reservation.create "$(resv "TwoPeople" "$W1S" "$W1E" "$(person Gina "$SA"),$(person Hank "$SB")")"); check "book 2-person reservation" "$R3" OK
GINA=$(qy reservation.get "{\"id\":\"$(field "$R3" reservation id)\"}" | python3 -c 'import sys,json
d=json.load(sys.stdin)["result"]["data"]; d=d.get("json",d)
print(next(p["id"] for p in d["people"] if p["name"]=="Gina"))')
check "cancel person Gina"                     "$(mu person.cancel "{\"id\":\"$GINA\"}")" OK
check "rebook Gina's ski → OK (freed)"         "$(mu reservation.create "$(resv "GinaFree" "$W1S" "$W1E" "$(person Xena "$SA")")")" OK
check "rebook Hank's ski → CONFLICT (still out)" "$(mu reservation.create "$(resv "HankTry" "$W1S" "$W1E" "$(person Yara "$SB")")")" CONFLICT

section "Reservation · whole-day convention (what the form sends)"
# pickup D1 -> return D2 must hold the gear for ALL of D2, so the next booking
# can only start on D3. This is what makes endOfDay the safe choice — regressing
# it to startOfDay frees the item a day early and these checks go red.
D1=2027-10-01; D2=2027-10-02; D3=2027-10-03; D5=2027-10-10
DAY=$(field "$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-06","length":170,"isVIP":false}')" equipmentItem id)
check "book pickup $D1 → return $D2"            "$(mu reservation.create "$(resv "DayConv" "$(S $D1)" "$(E $D2)" "$(person Nina "$DAY")")")" OK
check "next booking on the RETURN day → CONFLICT" "$(mu reservation.create "$(resv "OnReturn" "$(S $D2)" "$(E $D3)" "$(person Otto "$DAY")")")" CONFLICT
assert "gear hidden from findAvailable on return day" "$(contains_id "$(avail SKI "$(S $D2)" "$(E $D2)")" "$DAY")" no
check "next booking the DAY AFTER → OK"          "$(mu reservation.create "$(resv "DayAfter" "$(S $D3)" "$(E $D3)" "$(person Pavel "$DAY")")")" OK
check "single-day rental ($D5 → $D5) → OK"       "$(mu reservation.create "$(resv "OneDay" "$(S $D5)" "$(E $D5)" "$(person Rita "$DAY")")")" OK

section "Reservation · input validation"
SV=$(field "$(mu equipment.ski.create '{"brand":"SmokeTest","model":"Ski-05","length":170,"isVIP":false}')" equipmentItem id)
check "endDate == startDate → BAD_REQUEST"  "$(mu reservation.create "$(resv "ZeroLen" "$W1S" "$W1S" "$(person Zoe "$SV")")")" BAD_REQUEST
check "endDate < startDate → BAD_REQUEST"   "$(mu reservation.create "$(resv "Backwards" "$W1E" "$W1S" "$(person Zoe "$SV")")")" BAD_REQUEST
check "1-char person name → BAD_REQUEST"    "$(mu reservation.create "$(resv "ShortName" "$W1S" "$W1E" "$(person Z "$SV")")")" BAD_REQUEST
check "empty people array → BAD_REQUEST"    "$(mu reservation.create "$(resv "NoPeople" "$W1S" "$W1E" "")")" BAD_REQUEST

# -------------------------------------------------------------------- summary
printf '\n\033[1mResult:\033[0m %s passed' "$(grn "$PASS")"
[ "$FAIL" -gt 0 ] && printf ', %s failed\n' "$(red "$FAIL")" || printf ', 0 failed\n'
printf '%s\n' "$(dim "Records left in the DB — run scripts/cleanup.sh to wipe.")"
[ "$FAIL" -eq 0 ]
