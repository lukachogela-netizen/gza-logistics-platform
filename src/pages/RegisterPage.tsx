import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Building2, Mail, Phone, UserRound } from 'lucide-react';
import { registerRequest } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'სახელი და გვარი მინიმუმ 2 სიმბოლო უნდა იყოს.'),
  email: z.string().trim().email('შეიყვანე სწორი ელფოსტა.'),
  phone: z.string().trim().max(32, 'ტელეფონის ნომერი ზედმეტად გრძელია.').regex(/^$|^\+?\d[\d\s()-]{6,30}$/, 'შეიყვანე ტელეფონის სწორი ნომერი.').optional(),
  password: z.string().min(8, 'პაროლი მინიმუმ 8 სიმბოლოსგან უნდა შედგებოდეს.').regex(/\d/, 'პაროლი უნდა შეიცავდეს ციფრს.').regex(/[^A-Za-z0-9]/, 'პაროლი უნდა შეიცავდეს სპეციალურ სიმბოლოს.'),
  confirmPassword: z.string().min(1, 'გაიმეორე პაროლი.'),
  accountType: z.enum(['individual', 'company']),
  role: z.enum(['passenger', 'driver']),
  companyName: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.password !== values.confirmPassword) ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'პაროლები ერთმანეთს არ ემთხვევა.' });
  if (values.accountType === 'company' && !values.companyName?.trim()) ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'მიუთითე კომპანიის დასახელება.' });
});
type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const registrationState = location.state as { defaultRole?: 'passenger' | 'driver' } | null;
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accountType: 'individual', role: registrationState?.defaultRole ?? 'passenger' },
  });
  const accountType = watch('accountType');

  const submit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    void _confirmPassword;
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await registerRequest({
        ...values,
        companyName: values.accountType === 'company' ? values.companyName : undefined,
        role: values.accountType === 'company' ? 'passenger' : values.role,
      });
      setSession(result.token, result.user);
      navigate('/', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'რეგისტრაცია ვერ მოხერხდა.');
    } finally { setIsSubmitting(false); }
  });

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--wide" aria-labelledby="register-title">
        <Link className="auth-back-link" to="/"><ArrowLeft size={16} /> მთავარ გვერდზე დაბრუნება</Link>
        <div className="auth-brand-mark" aria-hidden="true">გ<span>.</span></div>
        <p className="eyebrow">შემოგვიერთდი</p>
        <h1 id="register-title">ანგარიშის შექმნა</h1>
        <p className="auth-subtitle">შექმენი ანგარიში ჯავშნებისა და რეისების სამართავად.</p>
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className={`form-field${errors.fullName ? ' form-field--error' : ''}`}>
            <label htmlFor="register-name">სახელი და გვარი <span>*</span></label>
            <div className="auth-input-wrap"><UserRound size={17} /><input id="register-name" autoComplete="name" {...register('fullName')} aria-invalid={Boolean(errors.fullName)} /></div>
            {errors.fullName && <small className="form-field__error">{errors.fullName.message}</small>}
          </div>
          <div className={`form-field${errors.email ? ' form-field--error' : ''}`}>
            <label htmlFor="register-email">ელფოსტა <span>*</span></label>
            <div className="auth-input-wrap"><Mail size={17} /><input id="register-email" type="email" autoComplete="email" {...register('email')} aria-invalid={Boolean(errors.email)} /></div>
            {errors.email && <small className="form-field__error">{errors.email.message}</small>}
          </div>
          <div className={`form-field${errors.phone ? ' form-field--error' : ''}`}>
            <label htmlFor="register-phone">ტელეფონი</label>
            <div className="auth-input-wrap"><Phone size={17} /><input id="register-phone" type="tel" autoComplete="tel" {...register('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'register-phone-error' : undefined} /></div>
            {errors.phone && <small id="register-phone-error" className="form-field__error">{errors.phone.message}</small>}
          </div>
          <div className="form-grid form-grid--two">
            <div className={`form-field${errors.password ? ' form-field--error' : ''}`}>
              <label htmlFor="register-password">პაროლი <span>*</span></label>
              <input id="register-password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={Boolean(errors.password)} />
              {errors.password && <small className="form-field__error">{errors.password.message}</small>}
            </div>
            <div className={`form-field${errors.confirmPassword ? ' form-field--error' : ''}`}>
              <label htmlFor="register-confirm">გაიმეორე პაროლი <span>*</span></label>
              <input id="register-confirm" type="password" autoComplete="new-password" {...register('confirmPassword')} aria-invalid={Boolean(errors.confirmPassword)} />
              {errors.confirmPassword && <small className="form-field__error">{errors.confirmPassword.message}</small>}
            </div>
          </div>
          <fieldset className="auth-radio-group">
            <legend>ანგარიშის ტიპი</legend>
            <label><input type="radio" value="individual" {...register('accountType')} /> ფიზიკური პირი</label>
            <label><input type="radio" value="company" {...register('accountType')} /> კომპანია</label>
          </fieldset>
          {accountType === 'individual' ? (
            <div className="form-field">
              <label htmlFor="register-role">მომხმარებლის როლი</label>
              <select id="register-role" {...register('role')}><option value="passenger">მგზავრი / დამკვეთი</option><option value="driver">მძღოლი / გადამზიდი</option></select>
            </div>
          ) : (
            <div className={`form-field${errors.companyName ? ' form-field--error' : ''}`}>
              <label htmlFor="register-company">კომპანიის დასახელება <span>*</span></label>
              <div className="auth-input-wrap"><Building2 size={17} /><input id="register-company" {...register('companyName')} aria-invalid={Boolean(errors.companyName)} /></div>
              {errors.companyName && <small className="form-field__error">{errors.companyName.message}</small>}
            </div>
          )}
          {serverError && <p className="form-alert" role="alert">{serverError}</p>}
          <button type="submit" className="button button--primary auth-submit" disabled={isSubmitting}>{isSubmitting ? 'ანგარიში იქმნება…' : 'რეგისტრაცია'}</button>
        </form>
        <p className="auth-switch">უკვე გაქვს ანგარიში? <Link to="/login">შესვლა</Link></p>
      </section>
    </main>
  );
}
