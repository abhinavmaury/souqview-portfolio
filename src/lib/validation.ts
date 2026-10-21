import { isTicker, type Ticker } from './market';

export type ErrorCode =
  | 'symbolRequired' | 'unknownSymbol' | 'required' | 'notNumber'
  | 'sharesPositive' | 'pricePositive' | 'precision' | 'tooLarge';
export interface TradeInput { symbol: string; shares: string; price: string }
export type FieldErrors = Partial<Record<keyof TradeInput, ErrorCode>>;
export type ValidationResult =
  | { ok: true; value: { symbol: Ticker; shares: number; price: number } }
  | { ok: false; errors: FieldErrors };

export const MAX_DECIMALS = 4;
export const MAX_SHARES = 10_000_000;
export const MAX_PRICE = 1_000_000;

/** Accept Arabic-Indic digits and the Arabic decimal separator so AR users can type naturally. */
export const normalizeNumeric = (s: string) =>
  s.trim()
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/\u066B/g, '.');

function parseField(raw: string, positive: ErrorCode, max: number): { value: number } | { error: ErrorCode } {
  const s = normalizeNumeric(raw);
  if (!s) return { error: 'required' };
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return { error: 'notNumber' };
  const n = Number(s);
  if (n <= 0) return { error: positive };
  if ((s.split('.')[1] ?? '').replace(/0+$/, '').length > MAX_DECIMALS) return { error: 'precision' };
  if (n > max) return { error: 'tooLarge' };
  return { value: n };
}

export function validateTrade(input: TradeInput): ValidationResult {
  const errors: FieldErrors = {};
  const sym = input.symbol.trim().toUpperCase();
  if (!sym) errors.symbol = 'symbolRequired';
  else if (!isTicker(sym)) errors.symbol = 'unknownSymbol';

  const shares = parseField(input.shares, 'sharesPositive', MAX_SHARES);
  if ('error' in shares) errors.shares = shares.error;
  const price = parseField(input.price, 'pricePositive', MAX_PRICE);
  if ('error' in price) errors.price = price.error;

  if (errors.symbol || errors.shares || errors.price || !('value' in shares) || !('value' in price)) {
    return { ok: false, errors };
  }
  return { ok: true, value: { symbol: sym as Ticker, shares: shares.value, price: price.value } };
}
