# SouqView Practice Portfolio

A bilingual (EN / عربي, true RTL) practice stock portfolio for first-time investors.
Vite + React + TypeScript + Tailwind, with Vitest covering every money calculation.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 37 tests: money, validation, storage
npm run build    # tsc --noEmit + vite build
```

## What was built

- **Fixed sample market and FX.** EMAAR 14.00, FAB 15.50, ADNOCGAS 3.40 (AED); AAPL 230, MSFT 430 (USD); 1 USD = 3.6725 AED. Constants live in `src/lib/market.ts`.
- **Practice trade form.** Stock, shares, buy price. The price label and an inline badge switch to **USD or AED** as soon as a stock is chosen, with a hint about the AED conversion for US stocks. Inline, translated errors cover: missing fields, unknown symbol, shares ≤ 0, price ≤ 0, non-numeric input (`abc`, `1e3`, `1,000`), more than 4 decimals, and absurdly large values. Arabic-Indic digits and `٫` are accepted.
- **Holdings.** Trades of the same ticker roll into one position: total shares, weighted average buy price (in the stock's own currency), cost, current value, gain/loss in AED and %. Each position expands to its individual trades, which can be deleted. The whole portfolio can be reset, with a two-step confirm.
- **Totals at the top.** Total value, total cost, total return (AED and %), all in AED.
- **Money math** is pure and isolated in `src/lib/money.ts`; tests in `money.test.ts` (AED positions, USD→AED at 3.6725, weighted average across trades, positive/negative P&L %, rounding edge cases).
- **Bilingual with real RTL.** `<html lang dir>` flips on toggle; layout uses logical utilities only (`ps-`/`pe-`/`ms-`/`me-`/`text-start`/`text-end`, `start`/`end` positioning). Every signed number is rendered inside an LTR isolate (`<bdi dir="ltr">`), so `−1,028.30` and `+4.88%` keep their sign and `%` in place in Arabic. Digits are Latin in both languages for consistency with market data.
- **Persistence.** Trades and language are saved to `localStorage`. Access, read, parse and write are all wrapped; corrupt JSON or malformed records fall back to an empty portfolio or are dropped individually (tested).

### Money-math decisions

- **Rounding happens once, at the end** (`shares × price × FX`, then round to 0.01 AED), never per-share first. 10 AAPL at 230 is 8,446.75, not 10 × 844.68.
- **Half away from zero**, with binary noise stripped first, so `1.005 → 1.01` and `−3.125% → −3.13%`. It never yields `-0`.
- **Totals are summed as integer fils**, so the totals always equal the sum of the rows you can see.
- A position's cost is the sum of its trades' rounded AED costs, so the trade list adds up to the position.

## What was cut (3-hour timebox)

- Live prices and a live FX feed; prices are hard-coded sample data.
- Selling / realised P&L, fees, dividends, and per-trade buy dates.
- Charts (allocation, performance over time).
- Component and end-to-end tests (UI is verified manually; the logic is unit tested), and an automated RTL visual check.
- Self-hosted fonts (IBM Plex Sans / Arabic load from Google Fonts with system fallbacks), and a card layout for narrow phones (the holdings table scrolls horizontally instead).
- Per-currency display toggle (always AED, as specified).

## What comes next

1. Real market data and FX behind a typed adapter, with "as of" timestamps and graceful stale-data states.
2. Sell trades with realised vs unrealised P&L (average-cost method).
3. Money as integer minor units end-to-end (or a decimal library) before any real-money feature.
4. Allocation and history charts; mobile card layout; Playwright tests for EN/AR and RTL.
5. Move persistence behind an interface so accounts and server sync can replace `localStorage`.
