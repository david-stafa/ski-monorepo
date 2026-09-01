# Seed data

`data/*.json` is the shop's 2025/26 stock, extracted once from
`Formular_final_25-26.xlsx`. Run it with:

```bash
pnpm --filter @ski-blazek/db db:seed
```

The script refuses to run against a database that already holds equipment — it
inserts, it does not reconcile. Reset first if you mean to re-seed.

## Where each column went

| Sheet | Rows | Becomes |
| --- | --- | --- |
| `Lyže dospělé` | 102 | `Ski` |
| `Lyže dětské` | 264 | `Ski`, `isKids` |
| `Lyže VIP` 2–41 | 40 | `Ski`, `isVIP` |
| `Lyže VIP` 42–67 | 26 | `Snowboard` |
| `Lyže VIP` 68–99 | 32 | `SnowboardBoot` |
| `Boty` | 451 | `SkiBoot` |
| `Helmy` | 138 | `Helmet` |

`Lyže VIP` is three datasets stacked in one sheet with no separator row; the
split above is by length and brand (144–172 cm skis, then boards, then
mondopoint boots).

`Karty` is the printing form, not stock, and was ignored.

The marker columns are free text and carry more than one signal each. `Dámské`,
`Dámská`, `Dívčí` → `gender: FEMALE`; `jr.`, `Dívčí` → `isKids`; `Staré` →
`isOld`; `VIP` → `isVIP`; `boa` → `isBoa`. `Nová`, `nový` and `lepší` are the
absence of `Staré`, so they set nothing. Colours were translated to the English
keys `colorOptions` uses. Brand typos were folded (`Fisher` → `Fischer`,
`Technika`/`Tecnnica` → `Tecnica`, `Razier` → `Razer`, `Volk` → `Volkl`,
`Brico` → `Briko`, `Mivida` → `Midida`, `Nordic` → `Nordica`, `Elap` → `Elan`,
`Reap` → `Reaper`, `GMU` → `GNU`, `Arbow` → `Arbor`).

Two of those folds were close enough to be worth confirming rather than
inferring: the sheet spelled the helmet brand `Razer` 6 times and `Razier` 5,
and `Midida` 9 times against one `Mivida`. David confirmed **Razer** and
**Midida** are correct (2026-08-31), so the 11 helmets under each name stand.

Model names were typed by hand and came back capitalised several ways, so the
first word of a model is capitalised when it was entirely lower case —
`exclusive` → `Exclusive`, `contact 08` → `Contact 08`, `speed 263` →
`Speed 263`. Only the first word, so `MX-R` and `M2 tron` survive intact. Two
were fixed by name: `Dstinct` → `DStinct` and `Grove` → `Groove`. Model years
were left alone: `Booster 7/09/10/12`, `Contact 08/09/10`, `Omedrive 7/8` and
`Speed 60/70/71` are separate skis, not typos of each other.

After that, 69 distinct brands and 63 distinct models remain across all 1046
items, with no two differing only by case, accent or a single character.

## Article numbers

Boots and helmets keep the numbers stickered on them. Ski boots take
`velikost`/`číslo` straight into `articleGroup`/`articleNumber`; helmets number
1–138 with no gaps. Skis and snowboards carry no sticker, so the transform
numbered them sequentially in sheet order — those numbers are ours to assign.
Snowboard boots had no numbers either and were numbered per size pool.

Seven stickers appeared twice in `Boty`. The second row of each pair is a
retired boot still listed on the form, so it is not imported — which leaves
every boot that *is* imported sitting on the number printed on it, with no
re-stickering. That is why `skiBoot.json` holds 444 rows and the sheet has 451.

| Sticker | Kept | Dropped |
| --- | --- | --- |
| 19.17 | Tecnica | Alpina |
| 20.3 | Lange, modrá | Lange, dámské |
| 21.22 | Lange, dámské, bílá | Lange, modré |
| 22.11 | Nordica | Tecnica |
| 22.29 | Atomic, dámské, bílá | Rossignol |
| 24.10 | Lange, dámské, bílá | Nordica |
| 24.21 | Nordica, dámské, černá | Roxa |

## Known gaps in the data

- **67 skis had a model name in the brand column** (`Zone 5`, `Exclusive`, `RL`,
  `MX-R`, `DStinct`, `Booster`, `Speed 263`…). All are Dynastar lines, so the
  brand was filled in and the sheet's text kept as the model — a wrong guess is
  correctable because the original name is still there. That is why Dynastar is
  223 of the 406 skis.
- **12 items still carry a name in `brand` with no model**: `Skytti`, `Frozen`
  and `XT team` (child skis), `Rebel`, `Bílý`, `Factory`, `Wood core` ×2,
  `Stuff surge`, `HP` and `Mitic` (snowboards), and the `Pale` helmet. No basis
  to guess a brand for these.
- **Snowboard boot colours were dropped** — `SnowboardBoot` has no colour column
  (9 rows).
- **Two helmets have no colour**: `Elan` (the cell said `dívčí`, read as gender)
  and `Giro` (the cell said `formule`).
- Compound shades kept their leading colour: `černá-bílá` → `black`,
  `šedá-bílá` → `grey`, `černo-červená` → `black`, `žlutozelená` → `yellow`,
  `černo/růžová` → `black`.
- `obřačka` on one child ski and `Atomic 7`'s model `7` were dropped — `Ski` has
  no description field, and `model` is `min(2)` on the API side.
- No half-size ski boots exist in the sheet; snowboard boots do have them.
