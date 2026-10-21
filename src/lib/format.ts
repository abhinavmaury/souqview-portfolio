import type { Lang } from '../i18n';

/** Latin digits in both languages keeps figures consistent with the market data. */
export const locale = (lang: Lang) => (lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-AE');

export const fmtNum = (n: number, lang: Lang, minDp = 2, maxDp = 2) =>
  new Intl.NumberFormat(locale(lang), { minimumFractionDigits: minDp, maximumFractionDigits: maxDp }).format(Math.abs(n));

/** Explicit sign + digits. Render inside <Num> (an LTR isolate) so the sign never drifts in RTL. */
export const fmtSigned = (n: number, lang: Lang, minDp = 2, maxDp = 2) =>
  `${n > 0 ? '+' : n < 0 ? '\u2212' : ''}${fmtNum(n, lang, minDp, maxDp)}`;

export const fmtPct = (n: number, lang: Lang) => `${fmtSigned(n, lang)}%`;

export const fmtDate = (ms: number, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { dateStyle: 'medium' }).format(ms);
