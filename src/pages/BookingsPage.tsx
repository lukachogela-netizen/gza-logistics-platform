import { useEffect } from 'react';
import { ArrowUpRight, CalendarCheck, Clock3, TicketCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlatformStore } from '../store/usePlatformStore';
import { formatCurrency, formatDate } from '../utils/format';

export function BookingsPage() {
  const bookings = usePlatformStore((state) => state.bookings);
  const initialize = usePlatformStore((state) => state.initialize);
  useEffect(() => { void initialize(); }, [initialize]);
  const totalSeats = bookings.reduce((total, booking) => total + (booking.seats ?? 1), 0);

  return (
    <main className="page-content">
      <section className="page-heading" aria-labelledby="bookings-heading">
        <div>
          <div className="breadcrumb"><span>სამუშაო სივრცე</span><span aria-hidden="true">/</span><strong>ჩემი ჯავშნები</strong></div>
          <p className="eyebrow">მოგზაურობის გეგმა</p>
          <h1 id="bookings-heading">ჩემი ჯავშნები</h1>
          <p className="page-heading__description">ჯავშნები ერთიან სთეითში ინახება და განახლდება მარშრუტის გვერდიდანაც.</p>
        </div>
        <Link className="button button--primary" to="/routes">მარშრუტების ნახვა <ArrowUpRight size={16} /></Link>
      </section>

      {bookings.length === 0 ? (
        <section className="empty-state empty-state--large"><span className="empty-state__icon"><CalendarCheck size={26} /></span><h2>ჯავშნები ჯერ არ გაქვს</h2><p>აირჩიე მარშრუტი მთავარ გვერდზე და დააჭირე „დაჯავშნას“ — ის აქ გამოჩნდება.</p><Link className="button button--primary" to="/routes">მარშრუტების მოძებნა</Link></section>
      ) : (
        <>
          <section className="booking-summary" aria-label="ჯავშნების შეჯამება"><div><span>დადასტურებული ჯავშნები</span><strong>{bookings.length}</strong></div><div><span>დაჯავშნილი ადგილები</span><strong>{totalSeats}</strong></div></section>
          <section className="booking-list" aria-label="ჩემი ჯავშნების სია">
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-row">
                <span className="booking-row__icon"><TicketCheck size={21} /></span>
                <div className="booking-row__route"><strong>{booking.from} <span aria-hidden="true">→</span> {booking.to}</strong><small><Clock3 size={14} /> {formatDate(booking.departureDate)} · {booking.departureTime}</small></div>
                <span className="status-pill status-pill--available"><span className="status-pill__dot" /> დადასტურებული</span>
                <strong className="booking-row__price">{formatCurrency(booking.price)}</strong>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
