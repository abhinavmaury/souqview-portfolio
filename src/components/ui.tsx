import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { fmtNum, fmtPct, fmtSigned } from '../lib/format';
import type { Totals } from '../lib/money';

/** LTR isolate: signs, digits and % stay in order inside RTL text. */
export function Num({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <bdi dir="ltr" className={`tabular-nums whitespace-nowrap ${className}`}>{children}</bdi>;
}

export const tone = (n: number, dark = false) =>
  n > 0 ? (dark ? 'text-[#6EE7A8]' : 'text-gain') : n < 0 ? (dark ? 'text-[#FF9D94]' : 'text-loss') : dark ? 'text-white' : 'text-muted';

export function Summary({ totals }: { totals: Totals }) {
  const { t, lang } = useI18n();
  const plain = (label: string, n: number) => (
    <div>
      <dt className="text-sm text-white/70">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">
        <Num>{fmtNum(n, lang)}</Num> <span className="text-sm font-normal text-white/70">{t('aed')}</span>
      </dd>
    </div>
  );
  return (
    <section aria-label={t('holdings')} className="bg-ink text-white">
      <dl className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:grid-cols-[1fr_1fr_1.5fr] sm:px-6">
        {plain(t('totalValue'), totals.valueAed)}
        {plain(t('totalCost'), totals.costAed)}
        <div>
          <dt className="text-sm text-white/70">{t('totalReturn')}</dt>
          <dd className={`mt-1 flex flex-wrap items-baseline gap-x-3 ${tone(totals.gainAed, true)}`}>
            <span className="text-3xl font-semibold">
              <Num>{fmtSigned(totals.gainAed, lang)}</Num> <span className="text-sm font-normal opacity-80">{t('aed')}</span>
            </span>
            <span className="text-lg font-medium"><Num>{fmtPct(totals.gainPct, lang)}</Num></span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
