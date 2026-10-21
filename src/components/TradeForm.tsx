import { useState, type FormEvent } from 'react';
import { useI18n, type Key } from '../i18n';
import { fmtNum } from '../lib/format';
import { MARKET, TICKERS, isTicker, type Ticker } from '../lib/market';
import { validateTrade, type ErrorCode, type FieldErrors } from '../lib/validation';

type Draft = { symbol: Ticker; shares: number; price: number };

function Err({ id, code }: { id: string; code?: ErrorCode }) {
  const { t } = useI18n();
  return code ? <p id={id} role="alert" className="mt-1.5 text-sm text-loss">{t(`err_${code}` as Key)}</p> : null;
}

export function TradeForm({ onAdd }: { onAdd: (d: Draft) => void }) {
  const { t, lang } = useI18n();
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const info = isTicker(symbol) ? MARKET[symbol] : null;
  const cur = info?.currency;
  const curName = cur === 'USD' ? t('curUSD') : t('curAED');

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = validateTrade({ symbol, shares, price });
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    onAdd(r.value);
    setShares('');
    setPrice('');
  }
  const cls = (bad?: ErrorCode) => `field ${bad ? 'field-error' : ''}`;

  return (
    <form noValidate onSubmit={submit} className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-lg font-semibold">{t('addTrade')}</h2>

      <div className="mt-4">
        <label htmlFor="symbol" className="mb-1.5 block text-sm font-medium">{t('symbol')}</label>
        <select id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className={cls(errors.symbol)}
          aria-invalid={!!errors.symbol} aria-describedby={errors.symbol ? 'symbol-err' : undefined}>
          <option value="">{t('chooseStock')}</option>
          {TICKERS.map((s) => <option key={s} value={s}>{s} · {MARKET[s].name[lang]} ({MARKET[s].currency})</option>)}
        </select>
        <Err id="symbol-err" code={errors.symbol} />
        {info && (
          <p className="mt-1.5 text-sm text-muted">
            {t('marketPrice')}: <bdi dir="ltr" className="tabular-nums">{fmtNum(info.price, lang)}</bdi> {cur === 'USD' ? t('usd') : t('aed')}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label htmlFor="shares" className="mb-1.5 block text-sm font-medium">{t('shares')}</label>
        <input id="shares" inputMode="decimal" autoComplete="off" value={shares} onChange={(e) => setShares(e.target.value)}
          className={cls(errors.shares)} placeholder="10" aria-invalid={!!errors.shares}
          aria-describedby={errors.shares ? 'shares-err' : undefined} />
        <Err id="shares-err" code={errors.shares} />
      </div>

      <div className="mt-4">
        <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
          {cur ? t('buyPriceIn', { cur: curName }) : t('buyPrice')}
        </label>
        <div className="relative">
          <input id="price" inputMode="decimal" autoComplete="off" value={price} onChange={(e) => setPrice(e.target.value)}
            className={`${cls(errors.price)} pe-16`} placeholder={info ? String(info.price) : '0.00'}
            aria-invalid={!!errors.price} aria-describedby={`price-hint${errors.price ? ' price-err' : ''}`} />
          {cur && (
            <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center rounded text-sm font-semibold text-brand" dir="ltr">
              {cur}
            </span>
          )}
        </div>
        <Err id="price-err" code={errors.price} />
        <p id="price-hint" className="mt-1.5 text-sm text-muted">
          {!cur ? t('hintPick') : cur === 'USD' ? t('hintUSD') : t('hintAED')}
        </p>
      </div>

      <button type="submit" className="btn mt-5 w-full bg-brand text-white hover:bg-[#094A41]">{t('addButton')}</button>
    </form>
  );
}
