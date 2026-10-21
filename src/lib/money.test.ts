import { describe, expect, it } from 'vitest';
import { FX_USD_AED, MARKET } from './market';
import {
  buildPositions, gainPct, marketValueAed, portfolioTotals, round2, roundTo, sumAed,
  toAed, tradeCostAed, weightedAvgPrice, type Trade,
} from './money';

let n = 0;
const trade = (symbol: Trade['symbol'], shares: number, price: number): Trade => ({ id: `t${n++}`, symbol, shares, price, createdAt: 0 });

describe('market constants', () => {
  it('uses the fixed sample prices and FX rate', () => {
    expect(FX_USD_AED).toBe(3.6725);
    expect(Object.entries(MARKET).map(([k, v]) => [k, v.currency, v.price])).toEqual([
      ['EMAAR', 'AED', 14], ['FAB', 'AED', 15.5], ['ADNOCGAS', 'AED', 3.4], ['AAPL', 'USD', 230], ['MSFT', 'USD', 430],
    ]);
  });
});

describe('rounding & floating-point edge cases', () => {
  it('rounds half away from zero where binary floats would round down', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(-1.005)).toBe(-1.01);
    expect(round2(-3.125)).toBe(-3.13);
    expect(round2(2.675)).toBe(2.68);
  });
  it('removes float drift in sums', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sumAed([0.1, 0.2])).toBe(0.3);
    expect(sumAed([1234.56, 0.07, -0.01])).toBe(1234.62);
  });
  it('never returns negative zero', () => {
    expect(Object.is(round2(-0.001), 0)).toBe(true);
    expect(Object.is(roundTo(-0, 2), 0)).toBe(true);
  });
  it('rounds once at the end rather than per share', () => {
    expect(toAed(230, 'USD')).toBe(844.68); // 844.675 per share
    expect(marketValueAed('AAPL', 10)).toBe(8446.75); // not 10 x 844.68
  });
});

describe('USD -> AED conversion at 3.6725', () => {
  it('converts whole and fractional amounts', () => {
    expect(toAed(1, 'USD')).toBe(3.67);
    expect(toAed(100, 'USD')).toBe(367.25);
    expect(toAed(100, 'AED')).toBe(100);
  });
  it('costs a US trade in AED', () => {
    expect(tradeCostAed(trade('AAPL', 10, 200))).toBe(7345);
  });
  it('does not apply FX to UAE stocks', () => {
    expect(tradeCostAed(trade('EMAAR', 100, 12.5))).toBe(1250);
  });
});

describe('single AED position', () => {
  it('computes cost, value and a positive gain', () => {
    const [p] = buildPositions([trade('EMAAR', 100, 12.5)]);
    expect(p).toMatchObject({ shares: 100, avgPrice: 12.5, costAed: 1250, valueAed: 1400, gainAed: 150, gainPct: 12 });
  });
  it('computes a negative gain and percentage', () => {
    const [p] = buildPositions([trade('ADNOCGAS', 100, 4)]);
    expect(p).toMatchObject({ costAed: 400, valueAed: 340, gainAed: -60, gainPct: -15 });
  });
  it('rounds a -3.125% return half away from zero', () => {
    const [p] = buildPositions([trade('FAB', 200, 16)]);
    expect(p.gainAed).toBe(-100);
    expect(p.gainPct).toBe(-3.13);
  });
  it('reports zero gain as exactly 0', () => {
    const [p] = buildPositions([trade('EMAAR', 5, 14)]);
    expect(p.gainAed).toBe(0);
    expect(p.gainPct).toBe(0);
  });
});

describe('USD position in AED', () => {
  it('converts cost and value and keeps the buy price in USD', () => {
    const [p] = buildPositions([trade('AAPL', 10, 200)]);
    expect(p.currency).toBe('USD');
    expect(p.avgPrice).toBe(200);
    expect(p).toMatchObject({ costAed: 7345, valueAed: 8446.75, gainAed: 1101.75, gainPct: 15 });
  });
  it('handles a US loss', () => {
    const [p] = buildPositions([trade('MSFT', 4, 500)]);
    expect(p).toMatchObject({ costAed: 7345, valueAed: 6316.7, gainAed: -1028.3, gainPct: -14 });
  });
});

describe('weighted average cost across trades', () => {
  it('weights by shares', () => {
    expect(weightedAvgPrice([{ shares: 10, price: 400 }, { shares: 5, price: 430 }])).toBe(410);
    expect(weightedAvgPrice([{ shares: 100, price: 10 }, { shares: 300, price: 14 }])).toBe(13);
  });
  it('is 0 with no shares', () => expect(weightedAvgPrice([])).toBe(0));
  it('aggregates multiple trades of one ticker into one position', () => {
    const ps = buildPositions([trade('MSFT', 10, 400), trade('MSFT', 5, 430)]);
    expect(ps).toHaveLength(1);
    expect(ps[0]).toMatchObject({ shares: 15, avgPrice: 410, costAed: 22585.88, valueAed: 23687.63, gainAed: 1101.75 });
    expect(ps[0].gainPct).toBe(4.88);
    expect(ps[0].trades).toHaveLength(2);
  });
  it('sums fractional shares without drift', () => {
    const [p] = buildPositions([trade('EMAAR', 0.1, 10), trade('EMAAR', 0.2, 10)]);
    expect(p.shares).toBe(0.3);
  });
  it('keeps different tickers separate, in order of first purchase', () => {
    const ps = buildPositions([trade('FAB', 1, 15), trade('AAPL', 1, 200), trade('FAB', 1, 16)]);
    expect(ps.map((p) => p.symbol)).toEqual(['FAB', 'AAPL']);
    expect(ps[0].shares).toBe(2);
  });
  it('skips trades with an unknown symbol', () => {
    expect(buildPositions([{ ...trade('FAB', 1, 1), symbol: 'NOPE' as never }])).toEqual([]);
  });
});

describe('gainPct', () => {
  it('is 0 without a cost basis', () => expect(gainPct(0, 100)).toBe(0));
  it('handles positive, negative and tiny returns', () => {
    expect(gainPct(1000, 1100)).toBe(10);
    expect(gainPct(1000, 900)).toBe(-10);
    expect(gainPct(3, 3.01)).toBe(0.33);
    expect(gainPct(1000, 1000.01)).toBe(0);
  });
});

describe('portfolio totals', () => {
  it('is all zero for an empty portfolio', () => {
    expect(portfolioTotals([])).toEqual({ costAed: 0, valueAed: 0, gainAed: 0, gainPct: 0 });
  });
  it('adds AED and USD positions together', () => {
    const t = portfolioTotals(buildPositions([trade('EMAAR', 100, 12.5), trade('AAPL', 10, 200)]));
    expect(t.costAed).toBe(8595); // 1250 + 7345
    expect(t.valueAed).toBe(9846.75); // 1400 + 8446.75
    expect(t.gainAed).toBe(1251.75);
    expect(t.gainPct).toBe(14.56); // 1251.75 / 8595
  });
  it('totals equal the sum of the displayed rows', () => {
    const ps = buildPositions([trade('MSFT', 3, 411.11), trade('AAPL', 7, 199.99), trade('FAB', 13, 15.37)]);
    const t = portfolioTotals(ps);
    expect(t.valueAed).toBe(sumAed(ps.map((p) => p.valueAed)));
    expect(t.costAed).toBe(sumAed(ps.map((p) => p.costAed)));
  });
});
