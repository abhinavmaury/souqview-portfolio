import { Fragment, useState } from 'react';
import { useI18n } from '../i18n';
import { fmtDate, fmtNum, fmtPct, fmtSigned } from '../lib/format';
import { MARKET } from '../lib/market';
import { tradeCostAed, type Position } from '../lib/money';
import { Num, tone } from './ui';

interface Props { positions: Position[]; onDelete: (id: string) => void; onReset: () => void }

export function Holdings({ positions, onDelete, onReset }: Props) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const toggle = (s: string) => setOpen((o) => { const n = new Set(o); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const unit = (c: string) => (c === 'USD' ? t('usd') : t('aed'));
  const th = 'px-3 py-2.5 text-sm font-medium text-muted';

  return (
    <section className="rounded-lg border border-line bg-white" aria-labelledby="holdings-h">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <h2 id="holdings-h" className="text-lg font-semibold">{t('holdings')}</h2>
        <div className="ms-auto flex items-center gap-2">
          {confirming ? (
            <>
              <span className="text-sm">{t('confirmReset')}</span>
              <button className="btn bg-loss text-white" onClick={() => { onReset(); setConfirming(false); setOpen(new Set()); }}>{t('confirmYes')}</button>
              <button className="btn border border-line" onClick={() => setConfirming(false)}>{t('cancel')}</button>
            </>
          ) : (
            <button className="btn border border-line text-loss disabled:opacity-40" disabled={!positions.length} onClick={() => setConfirming(true)}>
              {t('resetPortfolio')}
            </button>
          )}
        </div>
      </div>

      {!positions.length ? (
        <div className="px-5 py-12 text-center">
          <p className="font-medium">{t('emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted">{t('emptyBody')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="bg-paper">
                <th scope="col" className={`${th} ps-5 text-start`}>{t('colStock')}</th>
                <th scope="col" className={`${th} text-end`}>{t('colShares')}</th>
                <th scope="col" className={`${th} text-end`}>{t('colAvg')}</th>
                <th scope="col" className={`${th} text-end`}>{t('colCost')}</th>
                <th scope="col" className={`${th} text-end`}>{t('colValue')}</th>
                <th scope="col" className={`${th} text-end`}>{t('colGain')}</th>
                <th scope="col" className={`${th} pe-5`}><span className="sr-only">{t('holdings')}</span></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const isOpen = open.has(p.symbol);
                return (
                  <Fragment key={p.symbol}>
                    <tr className="border-t border-line align-top">
                      <th scope="row" className="py-3 ps-5 pe-3 text-start font-medium">
                        {p.symbol}
                        <span className="block text-xs font-normal text-muted">{MARKET[p.symbol].name[lang]}</span>
                      </th>
                      <td className="px-3 py-3 text-end"><Num>{fmtNum(p.shares, lang, 0, 4)}</Num></td>
                      <td className="px-3 py-3 text-end">
                        <Num>{fmtNum(p.avgPrice, lang, 2, 4)}</Num>
                        <span className="block text-xs text-muted">{unit(p.currency)}</span>
                      </td>
                      <td className="px-3 py-3 text-end"><Num>{fmtNum(p.costAed, lang)}</Num></td>
                      <td className="px-3 py-3 text-end"><Num>{fmtNum(p.valueAed, lang)}</Num></td>
                      <td className={`px-3 py-3 text-end font-medium ${tone(p.gainAed)}`}>
                        <Num>{fmtSigned(p.gainAed, lang)}</Num>
                        <span className="block text-xs"><Num>{fmtPct(p.gainPct, lang)}</Num></span>
                      </td>
                      <td className="py-3 pe-5 ps-3 text-end">
                        <button className="whitespace-nowrap text-sm font-medium text-brand underline-offset-2 hover:underline"
                          aria-expanded={isOpen} aria-controls={`trades-${p.symbol}`} onClick={() => toggle(p.symbol)}>
                          {isOpen ? t('hideTrades') : t('showTrades', { n: p.trades.length })}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr id={`trades-${p.symbol}`} className="bg-paper">
                        <td colSpan={7} className="px-5 py-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted">
                                <th scope="col" className="py-1.5 pe-3 text-start font-medium">{t('colDate')}</th>
                                <th scope="col" className="px-3 py-1.5 text-end font-medium">{t('colShares')}</th>
                                <th scope="col" className="px-3 py-1.5 text-end font-medium">{t('colPrice')}</th>
                                <th scope="col" className="px-3 py-1.5 text-end font-medium">{t('colCost')}</th>
                                <th scope="col" className="py-1.5 ps-3"><span className="sr-only">{t('remove')}</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.trades.map((tr) => (
                                <tr key={tr.id} className="border-t border-line">
                                  <td className="py-2 pe-3 text-start">{fmtDate(tr.createdAt, lang)}</td>
                                  <td className="px-3 py-2 text-end"><Num>{fmtNum(tr.shares, lang, 0, 4)}</Num></td>
                                  <td className="px-3 py-2 text-end"><Num>{fmtNum(tr.price, lang, 2, 4)}</Num> <span className="text-xs text-muted">{unit(p.currency)}</span></td>
                                  <td className="px-3 py-2 text-end"><Num>{fmtNum(tradeCostAed(tr), lang)}</Num></td>
                                  <td className="py-2 ps-3 text-end">
                                    <button className="text-sm font-medium text-loss underline-offset-2 hover:underline"
                                      aria-label={`${t('removeTrade')}: ${p.symbol}`} onClick={() => onDelete(tr.id)}>{t('remove')}</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
