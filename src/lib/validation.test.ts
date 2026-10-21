import { describe, expect, it } from 'vitest';
import { validateTrade } from './validation';

const errs = (symbol: string, shares: string, price: string) => {
  const r = validateTrade({ symbol, shares, price });
  return r.ok ? null : r.errors;
};

describe('validateTrade', () => {
  it('accepts a valid trade and normalises the symbol', () => {
    expect(validateTrade({ symbol: ' aapl ', shares: '10', price: '200.5' })).toEqual({ ok: true, value: { symbol: 'AAPL', shares: 10, price: 200.5 } });
  });
  it('flags every missing field', () => {
    expect(errs('', '', '  ')).toEqual({ symbol: 'symbolRequired', shares: 'required', price: 'required' });
  });
  it('rejects unknown symbols', () => expect(errs('TSLA', '1', '1')).toEqual({ symbol: 'unknownSymbol' }));
  it('rejects zero and negative shares / price', () => {
    expect(errs('FAB', '0', '15')).toEqual({ shares: 'sharesPositive' });
    expect(errs('FAB', '-3', '15')).toEqual({ shares: 'sharesPositive' });
    expect(errs('FAB', '3', '0')).toEqual({ price: 'pricePositive' });
    expect(errs('FAB', '3', '-1.5')).toEqual({ price: 'pricePositive' });
  });
  it('rejects non-numeric input', () => {
    for (const bad of ['abc', '1e3', '1,000', '12 5', 'NaN', 'Infinity', '--1']) expect(errs('FAB', bad, '15')).toEqual({ shares: 'notNumber' });
  });
  it('rejects unrealistic precision but allows trailing zeros', () => {
    expect(errs('FAB', '1.23456', '15')).toEqual({ shares: 'precision' });
    expect(errs('FAB', '1', '15.00001')).toEqual({ price: 'precision' });
    expect(errs('FAB', '1.50000', '15')).toBeNull();
  });
  it('rejects absurdly large values', () => {
    expect(errs('FAB', '99999999', '15')).toEqual({ shares: 'tooLarge' });
    expect(errs('FAB', '1', '5000000')).toEqual({ price: 'tooLarge' });
  });
  it('accepts Arabic-Indic digits and decimal separator', () => {
    expect(validateTrade({ symbol: 'FAB', shares: '١٢٫٥', price: '١٥' })).toMatchObject({ ok: true, value: { shares: 12.5, price: 15 } });
  });
});
