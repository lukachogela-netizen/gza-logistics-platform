import { memo, useEffect, useRef } from 'react';
import { SearchX } from 'lucide-react';
import type { RouteAction, TransportRoute } from '../types';
import { RouteCard } from './RouteCard';

interface RouteListProps {
  routes: TransportRoute[];
  loading: boolean;
  pendingRouteId: string | null;
  onAction: (action: RouteAction) => void;
  canManageRoute: (route: TransportRoute) => boolean;
}

export const RouteList = memo(function RouteList({ routes, loading, pendingRouteId, onAction, canManageRoute }: RouteListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Event delegation: one native listener handles actions for every rendered route card.
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) return;

    const handleListClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const actionButton = target.closest<HTMLButtonElement>('[data-route-action][data-route-id]');
      if (!actionButton || !listElement.contains(actionButton) || actionButton.disabled) return;

      const action = actionButton.dataset.routeAction;
      const routeId = actionButton.dataset.routeId;
      if (!routeId || (action !== 'book' && action !== 'edit' && action !== 'delete')) return;
      onAction({ type: action, routeId });
    };

    listElement.addEventListener('click', handleListClick);
    return () => listElement.removeEventListener('click', handleListClick);
  }, [onAction]);

  if (loading) {
    return <div className="route-grid" aria-label="მარშრუტები იტვირთება">{[1, 2, 3].map((item) => <div className="route-skeleton" key={item}><span /><span /><span /><span /></div>)}</div>;
  }

  if (routes.length === 0) {
    return <div className="empty-state"><span className="empty-state__icon"><SearchX size={24} /></span><h3>მარშრუტი ვერ მოიძებნა</h3><p>შეცვალე საძიებო სიტყვა ან გაასუფთავე ფილტრები.</p></div>;
  }

  return (
    <div className="route-grid" ref={listRef} aria-label="ხელმისაწვდომი მარშრუტების სია">
      {routes.map((route) => <RouteCard key={route.id} route={route} pendingBooking={pendingRouteId === route.id} canManage={canManageRoute(route)} />)}
    </div>
  );
});
