import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownToLine, ArrowUpRight, CircleDollarSign, History, WalletCards } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { getWallet, topupWallet, type WalletSnapshot } from '../services/walletService';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatDate } from '../utils/format';

const topupSchema = z.object({ amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'შეიყვანე სწორი თანხა.').transform(Number).pipe(z.number().min(1, 'მინიმუმ 1 ₾.').max(5000, 'მაქსიმუმ 5000 ₾.')) });
type TopupInput = z.input<typeof topupSchema>;
type TopupOutput = z.output<typeof topupSchema>;

export function WalletPage() {
  const user = useAuthStore((state) => state.user);
  const updateBalance = useAuthStore((state) => state.updateBalance);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TopupInput, unknown, TopupOutput>({ resolver: zodResolver(topupSchema) as unknown as Resolver<TopupInput, unknown, TopupOutput>, defaultValues: { amount: '50' } });

  useEffect(() => {
    let active = true;
    void getWallet().then((result) => {
      if (!active) return;
      setWallet(result);
      updateBalance(result.balance);
    }).catch((error: unknown) => {
      if (active) setPageError(error instanceof Error ? error.message : 'საფულის მონაცემები ვერ ჩაიტვირთა.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [updateBalance]);

  const submit = handleSubmit(async (values) => {
    setPageError('');
    setNotice('');
    try {
      const result = await topupWallet(values.amount);
      updateBalance(result.balance);
      setWallet((current) => current ? { ...current, balance: result.balance, transactions: [result.transaction, ...current.transactions] } : current);
      setNotice('სატესტო ბალანსი დაემატა. რეალური თანხის ჩამოჭრა არ ხდება.');
      reset({ amount: '50' });
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'ბალანსის შევსება ვერ მოხერხდა.');
    }
  });

  return (
    <main className="page-content">
      <section className="page-heading" aria-labelledby="wallet-heading">
        <div><div className="breadcrumb"><span>ანგარიში</span><span aria-hidden="true">/</span><strong>საფულე</strong></div><p className="eyebrow">ბალანსი და ოპერაციები</p><h1 id="wallet-heading">საფულე</h1><p className="page-heading__description">დემო ბალანსი და ტრანზაქციების ისტორია მძღოლის/კომპანიის შემოსავლებისა და სატესტო ჯავშნებისთვის.</p></div>
      </section>

      {loading ? <div className="route-skeleton wallet-skeleton"><span /><span /><span /></div> : (
        <>
          <section className="wallet-balance-card" aria-label="მიმდინარე ბალანსი">
            <span className="wallet-balance-card__icon"><WalletCards size={24} /></span>
            <p>მიმდინარე ბალანსი</p>
            <strong>{formatCurrency(wallet?.balance ?? user?.balance ?? 0)}</strong>
            <small>GEL · სატესტო ბალანსი, რეალური გადახდა გამორთულია</small>
          </section>
          <section className="wallet-topup-panel" aria-labelledby="wallet-topup-heading">
            <div className="section-heading"><div><p className="eyebrow">დემო ტრანზაქცია</p><h2 id="wallet-topup-heading">ბალანსის შევსება</h2></div><CircleDollarSign size={23} /></div>
            <form className="wallet-topup-form" onSubmit={submit} noValidate>
              <div className={`form-field${errors.amount ? ' form-field--error' : ''}`}><label htmlFor="wallet-amount">თანხა (₾)</label><input id="wallet-amount" type="number" min="1" max="5000" step="0.5" {...register('amount')} aria-invalid={Boolean(errors.amount)} />{errors.amount && <small className="form-field__error">{errors.amount.message}</small>}</div>
              <button className="button button--primary" type="submit" disabled={isSubmitting}><ArrowDownToLine size={16} />{isSubmitting ? 'ემატება…' : 'სატესტო ბალანსის დამატება'}</button>
            </form>
            {notice && <p className="form-success" role="status">{notice}</p>}
            {pageError && <p className="form-alert" role="alert">{pageError}</p>}
          </section>
          <section className="wallet-transactions" aria-labelledby="wallet-history-heading">
            <div className="section-heading"><div><p className="eyebrow">ანგარიშის აქტივობა</p><h2 id="wallet-history-heading">ტრანზაქციების ისტორია</h2></div><History size={22} /></div>
            {!wallet?.transactions.length ? <div className="empty-state"><h3>ტრანზაქციები ჯერ არ არის</h3><p>შევსებები და ჯავშნის ოპერაციები აქ გამოჩნდება.</p></div> : wallet.transactions.map((transaction) => (
              <article key={transaction.id} className="wallet-transaction-row"><span className={`wallet-transaction-row__icon wallet-transaction-row__icon--${transaction.type}`}><ArrowUpRight size={17} /></span><div><strong>{transaction.description}</strong><small>{formatDate(transaction.createdAt.slice(0, 10))}</small></div><strong className={`wallet-transaction-row__amount wallet-transaction-row__amount--${transaction.type}`}>{transaction.type === 'charge' ? '−' : '+'}{formatCurrency(transaction.amount)}</strong></article>
            ))}
          </section>
          <p className="wallet-disclaimer">ეს არის სატესტო ფინანსური მოდული სასწავლო პროექტისთვის. რეალურ გადახდებს, საბანკო ანგარიშებს ან საგადახდო პროვაიდერს არ უკავშირდება.</p>
        </>
      )}
    </main>
  );
}
