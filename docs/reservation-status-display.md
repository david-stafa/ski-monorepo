# What status a reservation, person and item can show

Inventory for the status-display cleanup. Terms are the ones in `CONTEXT.md`.

## Statuses

Where an item, person or reservation is in its lifecycle. An item has its own; a person and a reservation have a rolled-up one (the least advanced status that isn't Cancelled). Labels and colours live in `RESERVATION_STATUS_META` (`apps/web/src/domains/reservation/helpers/reservationStatus.ts`).

| Status | Means | Label | Badge (list) | Text (detail, drawer) |
| --- | --- | --- | --- | --- |
| Booked | promised for the dates, nothing done yet | Rezervováno | `secondary` (grey) | muted grey |
| Prepared | ready to hand over | Připraveno | `cyan` | cyan |
| Picked up | the customer has it | Vyzvednuto | `violet` | violet |
| Returned | back in the shop | Vráceno | `success` (green) | green |
| Cancelled | won't go out on this reservation | Zrušeno | `destructive` (red) | red |

## Flags

Something staff need to deal with, worked out by the API from the status and the reservation's dates. Labels and badges live in `apps/web/src/domains/reservation/components/FlagBadges.tsx`.

| Flag | Means | Label | Badge |
| --- | --- | --- | --- |
| Prep today | still Booked on the start date: prepare it today | Připravit dnes | `info` (primary tint), no icon |
| Late prep | still Booked after the start date | Nepřipraveno | `warning`, semibold, with a warning triangle |
| Missed pickup | still Prepared after the start date | Nevyzvednuto | `warning`, semibold, with a warning triangle |
| Overdue | still Picked up after the end date | Nevráceno | `warning`, semibold, with a warning triangle |

A Late prep, Missed pickup or Overdue item also has its equipment label in red.

## How many at once

**Item**: one status, at most one flag, and the flag always implies the status (Prep today and Late prep mean Booked, Missed pickup means Prepared, Overdue means Picked up). Showing the flag instead of the status loses nothing.

**Person / reservation**: flags roll up with "any", so they combine:

- Prep today only ever stands alone: on the start date nothing can be late, missed or overdue yet.
- After the start date: any mix of Late prep, Missed pickup and Overdue, so **at most 3**. Overdue only after the end date.
- The earliest flag in lifecycle order always implies the rolled-up status:

  | Earliest flag present | Rolled-up status is |
  | --- | --- |
  | Prep today or Late prep | Booked |
  | Missed pickup (no Late prep) | Prepared |
  | Overdue alone | Picked up |
  | none | anything: shown as the status |

  (Reason: every item shares the reservation's dates, so once the start date has passed anything still Booked is a Late prep and anything still Prepared a Missed pickup.)

## Per page

| Page | Rows it lists | Rolled-up status a row can have | Flags a row can have |
| --- | --- | --- | --- |
| All reservations | everything | all five | none, Prep today, or any mix of the other three (Returned and Cancelled rows never flagged) |
| Příprava | holds Booked | Booked | none, Prep today, or Late prep ± Missed pickup ± Overdue |
| Výdej | holds Booked or Prepared | Booked, Prepared | none, Prep today, or Late prep and/or Missed pickup, ± Overdue |
| Vrácení | holds Picked up | Booked, Prepared, Picked up | none, Prep today, or any mix of the other three |

## Display rule

Every row has one status spot. It shows **the row's flags if it has any, otherwise its status** (`FlagsOrStatus` in `FlagBadges.tsx`). The flag implies the status, so nothing is lost.

- All flags are shown, one badge each, in lifecycle order: Prep today, Late prep, Missed pickup, Overdue.
- In tables they are stacked; on the detail page and in the drawer they sit side by side.
- While a click in the drawer is still on its way, the row shows the status it is moving to instead of its flags, so the tick and the badge never disagree. Once the API answers, the rule applies again.

| Surface | Level | Status spot |
| --- | --- | --- |
| List row (all four pages) | reservation | the status column, 3rd after the actions and the name; flags stacked, otherwise the status badge |
| Detail page header | reservation | not a status spot: all flags beside the name, the status in the stepper below |
| Detail person card | person | flags, otherwise the person's status |
| Detail item row | item | its flag, otherwise its status |
| Counter drawer header | reservation | not a status spot: all flags beside the name |
| Counter drawer person | person | flags, otherwise the person's status, for everyone. No "x/y připraveno" count |
| Counter drawer item, in this step | item | its flag, otherwise its status |
| Counter drawer item, not yet at this step | item | its flag, otherwise what it waits for: "Čeká na přípravu" (Booked) or "Čeká na výdej" (Prepared), worded unlike the flags |
| Counter drawer item, past this step | item | its flag, otherwise its status |

Table columns on all four pages: actions, Jméno, Stav, Od, Do, Telefon, Osoby, Vybavení. Names longer than `max-w-56` (224 px) are cut short with the full name in a tooltip; the "Sezónní" badge beside them is never cut.
