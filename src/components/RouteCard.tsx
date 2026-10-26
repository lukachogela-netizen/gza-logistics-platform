import { ArrowDownUp, ArrowRight, CalendarDays, Clock3, Edit3, MapPin, MoreHorizontal, Users, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { TransportRoute } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface RouteCardProps {
  route: TransportRoute;
  pendingBooking: boolean;
  canManage: boolean;
}

export const RouteCard = memo(function RouteCard({ route, pendingBooking, canManage }: RouteCardProps) {
  const isFull = route.seatsAvailable <= 0;
  return (
    <article className="route-card">
      <div className="route-card__topline">
        <span className={`status-pill ${isFull ? 'status-pill--muted' : 'status-pill--available'}`}>
          {!isFull && <span className="status-pill__dot" />}{isFull ? 'ადგილები შევსებულია' : 'ხელმისაწვდომია'}
        </span>
        <Link className="icon-button route-card__more" to={`/routes/${route.id}`} aria-label={`${route.from}–${route.to} დეტალების ნახვა`}>
          <MoreHorizontal size={19} />
        </Link>
      </div>

      <div className="route-card__locations">
        <div className="route-card__location route-card__location--from">
          <span className="route-card__location-dot route-card__location-dot--start" />
          <div><small>გამგზავრება</small><strong>{route.from}</strong></div>
        </div>
        <div className="route-card__route-line"><span /><ArrowDownUp size={13} /><span /></div>
        <div className="route-card__location route-card__location--to">
          <span className="route-card__location-dot route-card__location-dot--end" />
          <div><small>დანიშნულება</small><strong>{route.to}</strong></div>
        </div>
      </div>

      <div className="route-card__meta">
        <span><CalendarDays size={15} /><time dateTime={`${route.departureDate}T${route.departureTime}`}>{formatDate(route.departureDate)}</time></span>
        <span><Clock3 size={15} />{route.departureTime}</span>
        <span><Users size={15} />{route.seatsAvailable} ადგილი</span>
      </div>

      <div className="route-card__driver">
        <span className="driver-avatar">{route.driverName.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>
        <span className="route-card__driver-info"><strong>{route.driverName}</strong><small>{route.vehicle}</small></span>
        <span className="route-card__price"><strong>{formatCurrency(route.price)}</strong><small>ერთ ადამიანზე</small></span>
      </div>

      {route.note && <p className="route-card__note">{route.note}</p>}

      <div className="route-card__actions">
        {canManage && (
          <button className="button button--soft button--small" type="button" data-route-action="edit" data-route-id={route.id}>
            <Edit3 size={14} /> რედაქტირება
          </button>
        )}
        <button className="button button--primary button--small route-card__book" type="button" data-route-action="book" data-route-id={route.id} disabled={isFull || pendingBooking}>
          {pendingBooking ? <span className="button-spinner" aria-hidden="true" /> : <><span>{isFull ? 'ადგილები აღარ არის' : 'დაჯავშნა'}</span>{!isFull && <ArrowRight size={15} />}</>}
        </button>
        {canManage && (
          <button className="icon-button route-card__delete" type="button" data-route-action="delete" data-route-id={route.id} aria-label={`${route.from}–${route.to} მარშრუტის წაშლა`}>
            <XCircle size={17} />
          </button>
        )}
      </div>
      <span className="route-card__pulse" aria-hidden="true"><MapPin size={12} /></span>
    </article>
  );
});
