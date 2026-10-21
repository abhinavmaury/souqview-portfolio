import { FX_USD_AED, MARKET, isTicker, type Currency, type Ticker } from './market';

export interface Trade { id: string; symbol: Ticker; shares: number; price: number; createdAt: number }
export interface Position {
  symbol: Ticker; currency: Currency; shares: number;
  /** Weighted average buy price in the stock's own currency. */
  avgPrice: number;
  costAed: number; valueAed: number; gainAed: number; gainPct: number; trades: Trade[];
}
export interface Totals { costAed: number; valueAed: number; gainAed: number; gainPct: number }

/** Strip binary floating-point noise (e.g. 100.49999999999999 -> 100.5). */
const clean = (n: number) => Number(n.toPrecision(12));

/** Round half away from zero (1.005 -> 1.01, -3.125 -> -3.13). Never returns -0. */
export function roundTo(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.sign(n) * Math.round(clean(Math.abs(n) * f)) / f + 0;
}
export const round2 = (n: number) => roundTo(n, 2);

export const fxRate = (c: Currency) => (c === 'USD' ? FX_USD_AED : 1);
export const toAed = (amount: number, c: Currency) => round2(amount * fxRate(c));

/** Integer fils (1/100 AED): sums of money are done in integers so totals always add up. */
const fils = (aed: number) => Math.round(clean(aed * 100));

/** Sum of AED amounts without float drift (0.1 + 0.2 -> 0.3). */
export const sumAed = (values: number[]) => values.reduce((a, v) => a + fils(v), 0) / 100;

/** Rounded once, at the end: shares x price x FX, never price-rounded-then-multiplied. */
export const tradeCostAed = (t: Pick<Trade, 'symbol' | 'shares' | 'price'>) =>
  round2(t.shares * t.price * fxRate(MARKET[t.symbol].currency));

export const marketValueAed = (symbol: Ticker, shares: number) =>
  round2(shares * MARKET[symbol].price * fxRate(MARKET[symbol].currency));

export const weightedAvgPrice = (trades: Pick<Trade, 'shares' | 'price'>[]) => {
  const shares = trades.reduce((a, t) => a + t.shares, 0);
  if (shares <= 0) return 0;
  return roundTo(trades.reduce((a, t) => a + t.shares * t.price, 0) / shares, 4);
};

/** Return % from two AED amounts; 0 when there is no cost basis. */
export const gainPct = (costAed: number, valueAed: number) =>
  fils(costAed) <= 0 ? 0 : roundTo(((fils(valueAed) - fils(costAed)) / fils(costAed)) * 100, 2);

/** Group trades by ticker (in order of first purchase) into positions. Unknown tickers are skipped. */
export function buildPositions(trades: Trade[]): Position[] {
  const groups = new Map<Ticker, Trade[]>();
  for (const t of trades) {
    if (!isTicker(t.symbol)) continue;
    groups.set(t.symbol, [...(groups.get(t.symbol) ?? []), t]);
  }
  return [...groups].map(([symbol, ts]) => {
    const shares = roundTo(ts.reduce((a, t) => a + t.shares, 0), 4);
    const costAed = sumAed(ts.map(tradeCostAed));
    const valueAed = marketValueAed(symbol, shares);
    return {
      symbol, currency: MARKET[symbol].currency, shares, avgPrice: weightedAvgPrice(ts),
      costAed, valueAed, gainAed: (fils(valueAed) - fils(costAed)) / 100,
      gainPct: gainPct(costAed, valueAed), trades: ts,
    };
  });
}

export function portfolioTotals(positions: Position[]): Totals {
  const costAed = sumAed(positions.map((p) => p.costAed));
  const valueAed = sumAed(positions.map((p) => p.valueAed));
  return { costAed, valueAed, gainAed: (fils(valueAed) - fils(costAed)) / 100, gainPct: gainPct(costAed, valueAed) };
}
