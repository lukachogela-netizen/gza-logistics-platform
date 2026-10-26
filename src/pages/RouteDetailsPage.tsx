import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, CarFront, Clock3, MapPin, TicketCheck, Users, WalletCards } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { getRouteById } from '../services/routesService';
import { useAuthStore } from '../store/useAuthStore';
import { usePlatformStore } from '../store/usePlatformStore';
import type { TransportRoute } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Toast } from '../components/Toast';

export function RouteDetailsPage() {
  const { id = '' } = useParams();
  const bookRoute = usePlatformStore((state) => state.bookRoute);
  const user = useAuthStore((state) => state.user);
  const initialize = usePlatformStore((state) => state.initialize);
  const [route, setRoute] = useState<TransportRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  const bookingLock = useRef(false);
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => {
    let active = true;
    void initialize();
    setLoading(true);
    setSeatCount(1);
    void getRouteById(id)
      .then((result) => { if (active) setRoute(result); })
      .catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'მარშრუტის ჩატვირთვა ვერ მოხერხდა.', 'error');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, initialize, showToast]);

  const submitBooking = useCallback(async () => {
    if (!route || bookingLock.current) return;
    if (route.seatsAvailable < seatCount) {
      showToast('მითითებული რაოდენობისთვის თავისუფალი ადგილები აღარ არის.', 'error');
      return;
    }
    bookingLock.current = true;
    setBooking(true);
    try {
      await bookRoute(route.id, user?.fullName ?? 'სტუმარი', seatCount);
      showToast('ჯავშანი წარმატებით შეიქმნა.', 'success');
      setSeatCount(1);
      const refreshed = await getRouteById(route.id);
      setRoute(refreshed);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ჯავშნის შექმნა ვერ მოხერხდა.';
      showToast(message.includes('Insufficient wallet balance') ? 'ბალანსი არასაკმარისია — გახსენი საფულე და შეავსე სატესტო ბალანსი.' : message, 'error');
    } finally {
      bookingLock.current = false;
      setBooking(false);
    }
  }, [bookRoute, route, seatCount, showToast, user?.fullName]);

  if (loading) {
    return <main className="page-content"><div className="route-skeleton route-details-skeleton" aria-label="მარშრუტის დეტალები იტვირთება"><span /><span /><span /><span /></div></main>;
  }

  if (!route) {
    return <main className="page-content"><section className="empty-state empty-state--large"><h1>მარშრუტი ვერ მოიძებნა</h1><p>ეს მარშრუტი წაშლილია ან მისამართი არასწორია.</p><Link to="/routes" className="button button--primary">მარშრუტებზე დაბრუნება</Link></section><Toast toast={toast} onDismiss={dismissToast} /></main>;
  }

  return (
    <main className="page-content route-details-page">
      <Link className="route-details-back" to="/routes"><ArrowLeft size={16} /> მარშრუტების სიაზე დაბრუნება</Link>
      <section className="route-details-hero" aria-labelledby="route-details-title">
        <div className="route-details-hero__heading">
          <span className={`status-pill ${route.seatsAvailable > 0 ? 'status-pill--available' : 'status-pill--muted'}`}>{route.seatsAvailable > 0 ? 'ხელმისაწვდომია' : 'ადგილები შევსებულია'}</span>
          <h1 id="route-details-title">{route.from} <span aria-hidden="true">→</span> {route.to}</h1>
          <p>მარშრუტის დეტალური ინფორმაცია და ჯავშნის პირობები.</p>
        </div>
        <div className="route-details-hero__price"><strong>{formatCurrency(route.price)}</strong><span>ერთ ადამიანზე</span></div>
      </section>

      <div className="route-details-grid">
        <section className="route-details-panel" aria-labelledby="route-details-info">
          <div className="section-heading"><div><p className="eyebrow">რეისის ინფორმაცია</p><h2 id="route-details-info">გამგზავრების დეტალები</h2></div><CarFront size={23} /></div>
          <dl className="route-details-info-grid">
            <div><dt><CalendarDays size={17} /> თარიღი</dt><dd><time dateTime={route.departureDate}>{formatDate(route.departureDate)}</time></dd></div>
            <div><dt><Clock3 size={17} /> დრო</dt><dd><time dateTime={`${route.departureDate}T${route.departureTime}`}>{route.departureTime}</time></dd></div>
            <div><dt><Users size={17} /> თავისუფალი ადგილები</dt><dd>{route.seatsAvailable}</dd></div>
            <div><dt><CarFront size={17} /> ტრანსპორტი</dt><dd>{route.vehicle}</dd></div>
            <div><dt><MapPin size={17} /> მძღოლი</dt><dd>{route.driverName}</dd></div>
            <div><dt><WalletCards size={17} /> ფასი</dt><dd>{formatCurrency(route.price)}</dd></div>
          </dl>
          {route.note && <div className="route-details-note"><strong>დამატებითი ინფორმაცია</strong><p>{route.note}</p></div>}
        </section>

        <aside className="route-details-booking" aria-labelledby="route-details-booking-title">
          <span className="route-details-booking__icon"><TicketCheck size={23} /></span>
          <h2 id="route-details-booking-title">დაჯავშნე ადგილი</h2>
          <p>დაჯავშნამდე გადაამოწმე გამგზავრების დრო, მიმართულება და ფასი.</p>
          <label className="route-details-seat-picker" htmlFor="booking-seat-count"><span>ადგილების რაოდენობა</span><select id="booking-seat-count" value={seatCount} onChange={(event) => setSeatCount(Number(event.target.value))} disabled={booking || route.seatsAvailable < 1}>
            {Array.from({ length: Math.max(1, Math.min(route.seatsAvailable, 60)) }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'ადგილი' : 'ადგილი'}</option>)}
          </select></label>
          <div className="route-details-booking__summary"><span>ფასი ერთ ადამიანზე</span><strong>{formatCurrency(route.price)}</strong></div>
          <div className="route-details-booking__summary route-details-booking__summary--total"><span>ჯამური ფასი ({seatCount} ადგილი)</span><strong>{formatCurrency(route.price * seatCount)}</strong></div>
          <button type="button" className="button button--primary route-details-booking__button" onClick={() => void submitBooking()} disabled={route.seatsAvailable < seatCount || booking}>
            {booking ? 'ჯავშანი იქმნება…' : route.seatsAvailable < seatCount ? 'არასაკმარისი ადგილები' : 'დაჯავშნა'}
          </button>
          <small>ჯავშნის დადასტურების შემდეგ დარჩენილი ადგილები ავტომატურად განახლდება.</small>
        </aside>
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
