import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';
import { loginRequest } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().trim().email('შეიყვანე სწორი ელფოსტა.'),
  password: z.string().min(1, 'პაროლი სავალდებულოა.'),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from || '/';
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await loginRequest(values.email, values.password);
      setSession(result.token, result.user);
      navigate(returnTo, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'სისტემაში შესვლა ვერ მოხერხდა.');
    } finally { setIsSubmitting(false); }
  });

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="auth-back-link" to="/"><ArrowLeft size={16} /> მთავარ გვერდზე დაბრუნება</Link>
        <div className="auth-brand-mark" aria-hidden="true">გ<span>.</span></div>
        <p className="eyebrow">მოგესალმებით</p>
        <h1 id="login-title">სისტემაში შესვლა</h1>
        <p className="auth-subtitle">შედი ანგარიშით, რომ მართო მარშრუტები და ნახო საკუთარი ჯავშნები.</p>
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className={`form-field${errors.email ? ' form-field--error' : ''}`}>
            <label htmlFor="login-email">ელფოსტა <span>*</span></label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="login-email" type="email" autoComplete="email" {...register('email')} aria-invalid={Boolean(errors.email)} /></div>
            {errors.email && <small className="form-field__error">{errors.email.message}</small>}
          </div>
          <div className={`form-field${errors.password ? ' form-field--error' : ''}`}>
            <label htmlFor="login-password">პაროლი <span>*</span></label>
            <div className="auth-input-wrap"><LockKeyhole size={17} /><input id="login-password" type="password" autoComplete="current-password" {...register('password')} aria-invalid={Boolean(errors.password)} /></div>
            {errors.password && <small className="form-field__error">{errors.password.message}</small>}
          </div>
          {serverError && <p className="form-alert" role="alert">{serverError}</p>}
          <button type="submit" className="button button--primary auth-submit" disabled={isSubmitting}>{isSubmitting ? 'მიმდინარეობს…' : 'შესვლა'}</button>
        </form>
        <p className="auth-switch">ჯერ არ გაქვს ანგარიში? <Link to="/register">რეგისტრაცია</Link></p>
        <p className="auth-note">ავტორიზაცია მუშაობს ბექენდის ჩართვისას (<code>npm run dev:full</code>).</p>
      </section>
    </main>
  );
}
