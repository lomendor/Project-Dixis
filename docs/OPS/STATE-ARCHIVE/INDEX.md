# STATE Archive Index

Historical pass records archived from `docs/OPS/STATE.md`.

## Archive Files

| File | Period | Notes |
|------|--------|-------|
| [STATE-2026-01-24-early.md](STATE-2026-01-24-early.md) | 2026-01-24 | CI Note, DOCS-ARCHIVE, UI-ROLE-NAV, SHIP-MULTI-DISCOVERY, UI-SHELL |
| [STATE-2026-01-17-early.md](STATE-2026-01-17-early.md) | 2026-01-17 | Passes before PROD-UNBLOCK-01 |
| [STATE-2026-01-16.md](STATE-2026-01-16.md) | 2026-01-16 | NOTIFICATIONS-01, EN-LANGUAGE-01, SEARCH-FTS-01, etc. |
| [STATE-2026-01-14-15.md](STATE-2026-01-14-15.md) | 2026-01-14 to 2026-01-15 | SEC-* passes, TEST-COVERAGE-01, SEC-UDEV-01 |
| [STATE-2026-Q1-EARLY.md](STATE-2026-Q1-EARLY.md) | 2026-01-04 to 2026-01-12 | Pass 58, 57, SEC-RCA-01, etc. |

## Why Archive?

- Active STATE.md kept ≤250 lines for fast agent boot
- No data lost — just moved to archive
- Each archive covers ~1 quarter or significant milestone

## Finding Old Passes

1. Check archive files above
2. Or use: `grep -r "Pass 57" docs/OPS/STATE-ARCHIVE/`
