import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CalendarDays, CarFront, MapPin, X } from 'lucide-react';
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import type { RouteFormValues, TransportRoute } from '../types';

const numericText = z.string().trim().min(1, 'შეიყვანე რიცხვი.').regex(/^\d+(\.\d+)?$/, 'შეიყვანე სწორი რიცხვი.').transform(Number);
const integerText = z.string().trim().min(1, 'შეიყვანე მთელი რიცხვი.').regex(/^\d+$/, 'შეიყვანე მთელი რიცხვი.').transform(Number);

const routeSchema = z.object({
  from: z.string().trim().min(2, 'გამგზავრების ადგილი მინიმუმ 2 სიმბოლო უნდა იყოს.'),
  to: z.string().trim().min(2, 'დანიშნულების ადგილი მინიმუმ 2 სიმბოლო უნდა იყოს.'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'აირჩიე სწორი თარიღი.').refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'თარიღი არ არსებობს.'),
  departureTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'მიუთითე სწორი დრო (00:00–23:59).'),
  price: numericText.pipe(z.number().finite().min(1, 'ფასი მინიმუმ 1 ₾ უნდა იყოს.').max(100000)),
  seatsAvailable: integerText.pipe(z.number().int().min(0, 'ადგილების რაოდენობა უარყოფითი ვერ იქნება.').max(60, 'ადგილების რაოდენობა 60-ს არ უნდა აღემატებოდეს.')),
  driverName: z.string().trim().min(2, 'მძღოლის სახელი მინიმუმ 2 სიმბოლო უნდა იყოს.'),
  vehicle: z.string().trim().min(2, 'მიუთითე სატრანსპორტო საშუალება.'),
  note: z.string().trim().max(180, 'შენიშვნა მაქსიმუმ 180 სიმბოლო უნდა იყოს.').optional(),
}).refine((values) => values.from.toLocaleLowerCase() !== values.to.toLocaleLowerCase(), {
  message: 'გამგზავრებისა და დანიშნულების ადგილი ერთნაირი ვერ იქნება.',
  path: ['to'],
});

type FormFields = z.input<typeof routeSchema>;
type ParsedFormValues = z.output<typeof routeSchema>;
type FieldName = keyof FormFields;

interface RouteFormModalProps {
  isOpen: boolean;
  route?: TransportRoute | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: RouteFormValues) => Promise<void>;
}

function routeToFields(route?: TransportRoute | null): FormFields {
  if (!route) return { from: '', to: '', departureDate: '', departureTime: '', price: '35', seatsAvailable: '4', driverName: '', vehicle: '', note: '' };
  return {
    from: route.from,
    to: route.to,
    departureDate: route.departureDate,
    departureTime: route.departureTime,
    price: String(route.price),
    seatsAvailable: String(route.seatsAvailable),
    driverName: route.driverName,
    vehicle: route.vehicle,
    note: route.note ?? '',
  };
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number(error.status);
    if (status === 401) return 'მარშრუტის სამართავად შედი სისტემაში. მძღოლის ან კომპანიის ანგარიშია საჭირო.';
    if (status === 403) return 'ამ მარშრუტის შეცვლის უფლება არ გაქვს.';
    if (status === 409) return 'მოქმედება კონფლიქტში მოვიდა მიმდინარე მონაცემებთან. განაახლე სია და სცადე ხელახლა.';
  }
  return error instanceof Error ? error.message : 'შენახვა ვერ მოხერხდა. სცადე ხელახლა.';
}

export function RouteFormModal({ isOpen, route, saving = false, onClose, onSave }: RouteFormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, reset, setFocus, formState: { errors, isSubmitting } } = useForm<FormFields, unknown, ParsedFormValues>({
    resolver: zodResolver(routeSchema) as unknown as Resolver<FormFields, unknown, ParsedFormValues>,
    defaultValues: routeToFields(route),
    mode: 'onBlur',
  });

  const busyRef = useRef(false);
  busyRef.current = saving || isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    reset(routeToFields(route));
    setFormError('');
    const timeoutId = window.setTimeout(() => setFocus('from'), 50);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeys);
    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeys);
      previousActiveElement.current?.focus();
    };
  }, [isOpen, route, onClose, reset, setFocus]);

  if (!isOpen) return null;

  const submit: SubmitHandler<ParsedFormValues> = async (parsed) => {
    if (saving || isSubmitting) return;
    setFormError('');
    const values: RouteFormValues = {
      ...parsed,
      from: parsed.from.trim(),
      to: parsed.to.trim(),
      driverName: parsed.driverName.trim(),
      vehicle: parsed.vehicle.trim(),
      note: parsed.note?.trim() || undefined,
    };
    try { await onSave(values); }
    catch (error) { setFormError(errorMessage(error)); }
  };

  const fieldClass = (name: FieldName) => `form-field${errors[name] ? ' form-field--error' : ''}`;
  const isBusy = saving || isSubmitting;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !isBusy) onClose(); }}>
      <section ref={panelRef} className="modal-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <div className="modal-panel__header">
          <span className="modal-panel__icon"><CarFront size={21} /></span>
          <div className="modal-panel__title-area">
            <p className="eyebrow">მარშრუტის მართვა</p>
            <h2 id={titleId}>{route ? 'მარშრუტის რედაქტირება' : 'ახალი მარშრუტი'}</h2>
            <p id={descriptionId}>შეავსე რეისის ინფორმაცია და შეინახე ცვლილებები.</p>
          </div>
          <button className="icon-button modal-panel__close" type="button" onClick={onClose} disabled={isBusy} aria-label="მოდალის დახურვა"><X size={19} /></button>
        </div>

        <form className="route-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="route-form__section-title"><MapPin size={16} /><span>მარშრუტის ინფორმაცია</span></div>
          <div className="form-grid form-grid--two">
            <div className={fieldClass('from')}>
              <label htmlFor="route-from">საიდან <span>*</span></label>
              <input id="route-from" autoComplete="address-level2" {...register('from')} placeholder="მაგ. თბილისი" aria-invalid={Boolean(errors.from)} aria-describedby={errors.from ? 'route-from-error' : undefined} />
              {errors.from && <small className="form-field__error" id="route-from-error">{errors.from.message}</small>}
            </div>
            <div className={fieldClass('to')}>
              <label htmlFor="route-to">სადამდე <span>*</span></label>
              <input id="route-to" autoComplete="address-level2" {...register('to')} placeholder="მაგ. ბათუმი" aria-invalid={Boolean(errors.to)} aria-describedby={errors.to ? 'route-to-error' : undefined} />
              {errors.to && <small className="form-field__error" id="route-to-error">{errors.to.message}</small>}
            </div>
          </div>

          <div className="route-form__section-title route-form__section-title--spaced"><CalendarDays size={16} /><span>დრო და ხელმისაწვდომობა</span></div>
          <div className="form-grid form-grid--two">
            <div className={fieldClass('departureDate')}>
              <label htmlFor="route-date">თარიღი <span>*</span></label>
              <input id="route-date" type="date" {...register('departureDate')} aria-invalid={Boolean(errors.departureDate)} />
              {errors.departureDate && <small className="form-field__error">{errors.departureDate.message}</small>}
            </div>
            <div className={fieldClass('departureTime')}>
              <label htmlFor="route-time">დრო <span>*</span></label>
              <input id="route-time" type="time" {...register('departureTime')} aria-invalid={Boolean(errors.departureTime)} />
              {errors.departureTime && <small className="form-field__error">{errors.departureTime.message}</small>}
            </div>
            <div className={fieldClass('price')}>
              <label htmlFor="route-price">ფასი (₾) <span>*</span></label>
              <input id="route-price" type="number" min="1" step="1" inputMode="numeric" {...register('price')} aria-invalid={Boolean(errors.price)} />
              {errors.price && <small className="form-field__error">{errors.price.message}</small>}
            </div>
            <div className={fieldClass('seatsAvailable')}>
              <label htmlFor="route-seats">თავისუფალი ადგილები <span>*</span></label>
              <input id="route-seats" type="number" min="0" max="60" step="1" inputMode="numeric" {...register('seatsAvailable')} aria-invalid={Boolean(errors.seatsAvailable)} />
              {errors.seatsAvailable && <small className="form-field__error">{errors.seatsAvailable.message}</small>}
            </div>
          </div>

          <div className="route-form__section-title route-form__section-title--spaced"><CarFront size={16} /><span>მძღოლი და ტრანსპორტი</span></div>
          <div className="form-grid form-grid--two">
            <div className={fieldClass('driverName')}>
              <label htmlFor="route-driver">მძღოლის სახელი <span>*</span></label>
              <input id="route-driver" {...register('driverName')} placeholder="სახელი და გვარი" aria-invalid={Boolean(errors.driverName)} />
              {errors.driverName && <small className="form-field__error">{errors.driverName.message}</small>}
            </div>
            <div className={fieldClass('vehicle')}>
              <label htmlFor="route-vehicle">სატრანსპორტო საშუალება <span>*</span></label>
              <input id="route-vehicle" {...register('vehicle')} placeholder="მაგ. Ford Transit" aria-invalid={Boolean(errors.vehicle)} />
              {errors.vehicle && <small className="form-field__error">{errors.vehicle.message}</small>}
            </div>
          </div>
          <div className={fieldClass('note')}>
            <label htmlFor="route-note">დამატებითი შენიშვნა <span className="optional-label">არასავალდებულო</span></label>
            <textarea id="route-note" rows={2} maxLength={180} {...register('note')} placeholder="ინფორმაცია გაჩერების, ბარგის ან სხვა პირობების შესახებ" aria-invalid={Boolean(errors.note)} />
            {errors.note && <small className="form-field__error">{errors.note.message}</small>}
          </div>

          {formError && <p className="form-alert" role="alert"><AlertCircle size={16} />{formError}</p>}
          <div className="modal-panel__footer">
            <span className="required-note"><span>*</span> სავალდებულო ველი</span>
            <div className="modal-panel__footer-actions">
              <button className="button button--ghost" type="button" onClick={onClose} disabled={isBusy}>გაუქმება</button>
              <button className="button button--primary" type="submit" disabled={isBusy}>
                {isBusy && <span className="button-spinner" aria-hidden="true" />}
                {isBusy ? 'ინახება…' : route ? 'ცვლილებების შენახვა' : 'მარშრუტის დამატება'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
