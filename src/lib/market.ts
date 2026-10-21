/** Fixed sample market data. 1 USD = 3.6725 AED (the UAE dirham peg). */
export const FX_USD_AED = 3.6725;

export type Currency = 'AED' | 'USD';

export const MARKET = {
  EMAAR: { currency: 'AED', price: 14.0, name: { en: 'Emaar Properties', ar: 'إعمار العقارية' } },
  FAB: { currency: 'AED', price: 15.5, name: { en: 'First Abu Dhabi Bank', ar: 'بنك أبوظبي الأول' } },
  ADNOCGAS: { currency: 'AED', price: 3.4, name: { en: 'ADNOC Gas', ar: 'أدنوك للغاز' } },
  AAPL: { currency: 'USD', price: 230.0, name: { en: 'Apple', ar: 'أبل' } },
  MSFT: { currency: 'USD', price: 430.0, name: { en: 'Microsoft', ar: 'مايكروسوفت' } },
} as const satisfies Record<string, { currency: Currency; price: number; name: { en: string; ar: string } }>;

export type Ticker = keyof typeof MARKET;
export const TICKERS = Object.keys(MARKET) as Ticker[];
export const isTicker = (s: string): s is Ticker => Object.prototype.hasOwnProperty.call(MARKET, s);
