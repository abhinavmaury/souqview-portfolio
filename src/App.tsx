import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Holdings } from './components/Holdings';
import { TradeForm } from './components/TradeForm';
import { Summary } from './components/ui';
import { I18nProvider, useI18n, type Lang } from './i18n';
import { buildPositions, portfolioTotals, type Trade } from './lib/money';
import { loadLang, loadTrades, saveLang, saveTrades } from './lib/storage';

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function Shell({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const { t } = useI18n();
  const [trades, setTrades] = useState<Trade[]>(() => loadTrades());
  const positions = useMemo(() => buildPositions(trades), [trades]);
  const totals = useMemo(() => portfolioTotals(positions), [positions]);

  useEffect(() => { saveTrades(trades); }, [trades]);
  useEffect(() => { document.title = t('appTitle'); }, [t]);

  const seg = (l: Lang, label: string) => (
    <button type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}
      className={`px-3 py-1.5 text-sm font-medium ${lang === l ? 'bg-white text-ink' : 'text-white/80 hover:text-white'}`}>
      {label}
    </button>
  );

  return (
    <>
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-5 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold">{t('appTitle')}</h1>
            <p className="text-sm text-white/70">{t('tagline')}</p>
          </div>
          <div role="group" aria-label={t('langLabel')} className="ms-auto flex overflow-hidden rounded-md border border-white/30">
            {seg('en', 'EN')}
            {seg('ar', 'ع')}
          </div>
        </div>
      </header>
      <Summary totals={totals} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <TradeForm onAdd={(d) => setTrades((ts) => [...ts, { ...d, id: newId(), createdAt: Date.now() }])} />
        <Holdings positions={positions} onDelete={(id) => setTrades((ts) => ts.filter((x) => x.id !== id))} onReset={() => setTrades([])} />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-sm text-muted sm:px-6">{t('fxNote')}</footer>
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => loadLang());
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    saveLang(lang);
  }, [lang]);
  return (
    <I18nProvider lang={lang}>
      <Shell lang={lang} setLang={setLang} />
    </I18nProvider>
  );
}
