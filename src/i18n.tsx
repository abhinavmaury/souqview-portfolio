import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { FX_USD_AED } from './lib/market';

export type Lang = 'en' | 'ar';

const en = {
  appTitle: 'SouqView Practice Portfolio',
  tagline: 'Try out trades with pretend money. Nothing here is real.',
  langLabel: 'Language',
  totalValue: 'Total value', totalCost: 'Total cost', totalReturn: 'Total return',
  aed: 'AED', usd: 'USD',
  addTrade: 'Add a practice trade',
  symbol: 'Stock', chooseStock: 'Choose a stock',
  shares: 'Number of shares',
  buyPrice: 'Buy price per share', buyPriceIn: 'Buy price per share, in {cur}',
  curAED: 'UAE dirhams (AED)', curUSD: 'US dollars (USD)',
  hintPick: 'Pick a stock to see which currency to use.',
  hintAED: 'UAE stock: enter the price in AED.',
  hintUSD: 'US stock: enter the price in USD. We convert to AED at 1 USD = {fx} AED.',
  marketPrice: 'Sample market price',
  addButton: 'Add trade',
  holdings: 'Holdings',
  emptyTitle: 'No trades yet', emptyBody: 'Add your first practice trade to see how it performs.',
  colStock: 'Stock', colShares: 'Shares', colAvg: 'Avg. buy price', colCost: 'Cost (AED)',
  colValue: 'Value (AED)', colGain: 'Gain / loss (AED)', colDate: 'Date', colPrice: 'Buy price',
  showTrades: 'View trades ({n})', hideTrades: 'Hide trades',
  remove: 'Delete', removeTrade: 'Delete this trade',
  resetPortfolio: 'Reset portfolio', confirmReset: 'Delete all trades?', confirmYes: 'Yes, delete all', cancel: 'Cancel',
  fxNote: 'Prices are fixed samples. 1 USD = {fx} AED.',
  err_symbolRequired: 'Choose a stock.',
  err_unknownSymbol: 'We don’t know that stock. Choose one from the list.',
  err_required: 'This field is required.',
  err_notNumber: 'Enter a number, like 25 or 12.5.',
  err_sharesPositive: 'Shares must be greater than 0.',
  err_pricePositive: 'Price must be greater than 0.',
  err_precision: 'Use at most 4 decimal places.',
  err_tooLarge: 'That number is too large to be realistic.',
};
export type Key = keyof typeof en;

const ar: Record<Key, string> = {
  appTitle: 'محفظة سوق فيو التجريبية',
  tagline: 'جرّب الصفقات بأموال افتراضية. لا شيء هنا حقيقي.',
  langLabel: 'اللغة',
  totalValue: 'إجمالي القيمة', totalCost: 'إجمالي التكلفة', totalReturn: 'إجمالي العائد',
  aed: 'د.إ', usd: 'دولار',
  addTrade: 'أضف صفقة تجريبية',
  symbol: 'السهم', chooseStock: 'اختر سهمًا',
  shares: 'عدد الأسهم',
  buyPrice: 'سعر الشراء للسهم', buyPriceIn: 'سعر الشراء للسهم، بـ{cur}',
  curAED: 'الدرهم الإماراتي (AED)', curUSD: 'الدولار الأمريكي (USD)',
  hintPick: 'اختر سهمًا لمعرفة العملة المطلوبة.',
  hintAED: 'سهم إماراتي: أدخل السعر بالدرهم.',
  hintUSD: 'سهم أمريكي: أدخل السعر بالدولار. نحوّله إلى الدرهم بسعر 1 دولار = {fx} درهم.',
  marketPrice: 'سعر السوق التجريبي',
  addButton: 'أضف الصفقة',
  holdings: 'الممتلكات',
  emptyTitle: 'لا توجد صفقات بعد', emptyBody: 'أضف أول صفقة تجريبية لترى أداءها.',
  colStock: 'السهم', colShares: 'الأسهم', colAvg: 'متوسط سعر الشراء', colCost: 'التكلفة (د.إ)',
  colValue: 'القيمة (د.إ)', colGain: 'الربح / الخسارة (د.إ)', colDate: 'التاريخ', colPrice: 'سعر الشراء',
  showTrades: 'عرض الصفقات ({n})', hideTrades: 'إخفاء الصفقات',
  remove: 'حذف', removeTrade: 'حذف هذه الصفقة',
  resetPortfolio: 'إعادة تعيين المحفظة', confirmReset: 'حذف جميع الصفقات؟', confirmYes: 'نعم، احذف الكل', cancel: 'إلغاء',
  fxNote: 'الأسعار تجريبية وثابتة. 1 دولار = {fx} درهم.',
  err_symbolRequired: 'اختر سهمًا.',
  err_unknownSymbol: 'هذا السهم غير معروف. اختر سهمًا من القائمة.',
  err_required: 'هذا الحقل مطلوب.',
  err_notNumber: 'أدخل رقمًا، مثل 25 أو 12.5.',
  err_sharesPositive: 'يجب أن يكون عدد الأسهم أكبر من 0.',
  err_pricePositive: 'يجب أن يكون السعر أكبر من 0.',
  err_precision: 'استخدم 4 منازل عشرية على الأكثر.',
  err_tooLarge: 'الرقم كبير جدًا بحيث لا يبدو واقعيًا.',
};

const dicts = { en, ar };
type TFn = (key: Key, vars?: Record<string, string | number>) => string;
const Ctx = createContext<{ lang: Lang; t: TFn }>({ lang: 'en', t: (k) => en[k] });

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => {
    const t: TFn = (key, vars = {}) =>
      dicts[lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(k === 'fx' ? FX_USD_AED : vars[k] ?? ''));
    return { lang, t };
  }, [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
