import { describe, expect, it } from 'vitest';
import { loadTrades, parseTrades, saveTrades } from './storage';

const good = { id: 'a', symbol: 'FAB', shares: 2, price: 15.5, createdAt: 1 };
const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe('storage', () => {
  it('round-trips trades', () => {
    const s = memory();
    expect(saveTrades([good as never], s)).toBe(true);
    expect(loadTrades(s)).toEqual([good]);
  });
  it('survives corrupt JSON and wrong shapes', () => {
    expect(parseTrades('{not json')).toEqual([]);
    expect(parseTrades('{"a":1}')).toEqual([]);
    expect(parseTrades(null)).toEqual([]);
  });
  it('drops malformed trades but keeps valid ones', () => {
    const raw = JSON.stringify([good, { ...good, symbol: 'NOPE' }, { ...good, shares: -1 }, { ...good, price: 'x' }, null, { ...good, id: 1 }]);
    expect(parseTrades(raw)).toEqual([good]);
  });
  it('does not throw when storage throws or is missing', () => {
    const boom = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('quota'); } };
    expect(loadTrades(boom)).toEqual([]);
    expect(saveTrades([], boom)).toBe(false);
    expect(saveTrades([], undefined)).toBe(false);
  });
});
