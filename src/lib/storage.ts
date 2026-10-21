import { isTicker } from './market';
import type { Trade } from './money';

const TRADES_KEY = 'souqview.trades.v1';
const LANG_KEY = 'souqview.lang';
type Store = Pick<Storage, 'getItem' | 'setItem'>;

/** Accessing localStorage can itself throw (privacy modes, blocked cookies). */
export function safeStorage(): Store | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

const isPosNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

/** Parse stored JSON, keeping only well-formed trades; corrupt data yields []. */
export function parseTrades(raw: string | null): Trade[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.flatMap((r: any): Trade[] =>
      r && typeof r.id === 'string' && typeof r.symbol === 'string' && isTicker(r.symbol) && isPosNum(r.shares) && isPosNum(r.price)
        ? [{ id: r.id, symbol: r.symbol, shares: r.shares, price: r.price, createdAt: Number.isFinite(r.createdAt) ? r.createdAt : 0 }]
        : [],
    );
  } catch { return []; }
}

export function loadTrades(store: Store | undefined = safeStorage()): Trade[] {
  try { return parseTrades(store?.getItem(TRADES_KEY) ?? null); } catch { return []; }
}

export function saveTrades(trades: Trade[], store: Store | undefined = safeStorage()): boolean {
  try { store?.setItem(TRADES_KEY, JSON.stringify(trades)); return !!store; } catch { return false; }
}

export function loadLang(store: Store | undefined = safeStorage()): 'en' | 'ar' {
  try { return store?.getItem(LANG_KEY) === 'ar' ? 'ar' : 'en'; } catch { return 'en'; }
}
export function saveLang(lang: 'en' | 'ar', store: Store | undefined = safeStorage()) {
  try { store?.setItem(LANG_KEY, lang); } catch { /* non-essential */ }
}
