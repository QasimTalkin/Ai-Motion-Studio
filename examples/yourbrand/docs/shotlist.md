# yourbrand.ca: shot list

> yourbrand.ca is a **fictional** brand made up to demo this studio: an invoicing app for small
> Canadian businesses. Its product UI is a real page in `site/` (dashboard + client pay page),
> captured with Playwright by `site/capture.mjs` like any real product. Swap in your own brand.

**Logline:** late invoices are a chore; yourbrand.ca makes them chase themselves.
**Duration / BPM / formats:** 20 s · 120 BPM (1 beat = 0.5 s, 1 bar = 2 s) · 9:16, 16:9
**Music:** synthesized `pulse` in D minor, drums out for bar 8, final hit on beat 35

## Assets (from `site/`, captured into `assets/` at 2x)
| File | What it is |
|---|---|
| `logo.svg` | the mark: accent square, invoice sheet, check |
| `sidebar.png` `topbar.png` `kpi1-3.png` `table.png` `remind_off.png` | dashboard pieces, transparent corners |
| `modal.png` → `modal_sent.png` | New invoice dialog before / after Send |
| `remind_on.png` | Reminders card with auto-reminders on (4 scheduled emails) |
| `pay.png` → `pay_paid.png`, `table_paid.png` | client pay page before / after, invoice row flips to Paid |
| `layout.json` | click targets inside each piece (cursor lands on real buttons) |

**Colors:** accent `#FF4A1C` (one accent), ink `#121417`, paper `#FAF8F4`. **Type:** Inter 800 kinetic, Source Serif 4 italic for the accent words.

| # | Beats (time) | Shot | Technique | Camera | On-screen text | SFX |
|---|---|---|---|---|---|---|
| 1 | 0-5.5 (0-2.75s) | Hook | words rise from slots on the beat, "late." in accent serif italic | slow push | Clients pay late. Every time. | thump per word |
| 2 | 5.5-12 (2.75-6s) | Product assembles | circle wipe out of the period of "late."; sidebar, topbar, KPIs, table, reminders fly in on 8ths | push | (the real dashboard) | whoosh, swipe, pops |
| 3 | 12-18.5 (6-9.25s) | Feature 1: invoice | cursor clicks + New invoice, dialog springs out of the button, cursor clicks Send → Sent | dashboard dims | Invoice in 30 seconds. | click, whoosh, click, chime |
| 4 | 18.5-24.5 (9.25-12.25s) | Feature 2: reminders | push left; cursor flips the Auto-reminders switch, the card grows, 4 emails slide in | locked | Reminders that chase for you. | click, swipe, pop × 4 |
| 5 | 24.5-30 (12.25-15s) | Feature 3: get paid | push up; cursor taps Pay with Interac → Paid; the invoice row flips Overdue → Paid | locked | Paid in one tap. | click, chime, pop |
| 6 | 30-34.5 (15-17.25s) | Metric | accent circle wipe out of the Paid pill; counter 17.4 → 6.2 days | beat pulse | 6.2 days to get paid · was 17.4 | ticks, click (drums out) |
| 7 | 34.5-40 (17.25-20s) | Lockup + CTA | the whole accent frame morphs into the logo square, wordmark, tagline, CTA pill | drift | yourbrand.ca · Invoices that chase themselves. · Try it free at yourbrand.ca | riser → impact, thump, pop, click |

**Last frame:** the lockup holds for 1 bar.
