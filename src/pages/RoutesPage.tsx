import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownUp, ArrowRight, CalendarDays, CarFront, CirclePlus, Filter, MapPinned, PackageCheck, Search, ShieldCheck, SlidersHorizontal, Users, WalletCards } from 'lucide-react';
import { RouteFormModal } from '../components/RouteFormModal';
import { RouteList } from '../components/RouteList';
import { RouteMap } from '../components/RouteMap';
import { StatCard } from '../components/StatCard';
import { Toast } from '../components/Toast';
import { useFilterRoutes, type AvailabilityFilter } from '../hooks/useFilterRoutes';
import { useToast } from '../hooks/useToast';
import { usePlatformStore } from '../store/usePlatformStore';
import { useAuthStore } from '../store/useAuthStore';
import type { RouteAction, RouteFormValues, TransportRoute } from '../types';
import { formatDate } from '../utils/format';

export function RoutesPage() {
  const routes = usePlatformStore((state) => state.routes);
  const bookings = usePlatformStore((state) => state.bookings);
  const loading = usePlatformStore((state) => state.loading);
  const dataSource = usePlatformStore((state) => state.dataSource);
  const sourceMessage = usePlatformStore((state) => state.sourceMessage);
  const initialize = usePlatformStore((state) => state.initialize);
  const saveRoute = usePlatformStore((state) => state.saveRoute);
  const deleteRoute = usePlatformStore((state) => state.deleteRoute);
  const bookRoute = usePlatformStore((state) => state.bookRoute);
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [savingRoute, setSavingRoute] = useState(false);
  const savingRef = useRef(false);
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null);
  const bookingLock = useRef(new Set<string>());
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => { void initialize(); }, [initialize]);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const { filteredRoutes: visibleRoutes } = useFilterRoutes(routes, query, availabilityFilter, {
    from: fromFilter,
    to: toFilter,
    date: dateFilter,
    maxPrice: maxPriceFilter,
  });
  const canCreateRoutes = Boolean(user && ['driver', 'company', 'admin'].includes(user.role));
  const canManageRoute = useCallback((route: TransportRoute) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return (user.role === 'driver' || user.role === 'company') && route.ownerId === user.id;
  }, [user]);

  const stats = useMemo(() => {
    const activeCount = routes.filter((route) => route.seatsAvailable > 0).length;
    const fullCount = routes.length - activeCount;
    const averagePrice = Math.round(routes.length ? routes.reduce((sum, route) => sum + route.price, 0) / routes.length : 0);
    const potentialRevenue = Math.round(routes.reduce((sum, route) => sum + route.price * Math.max(0, route.seatsAvailable), 0));
    return { activeCount, fullCount, averagePrice, potentialRevenue, bookingCount: bookings.length };
  }, [routes, bookings.length]);

  const openCreateModal = useCallback(() => {
    setSelectedRoute(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (savingRef.current) return;
    setModalOpen(false);
    setSelectedRoute(null);
  }, []);

  const handleSaveRoute = useCallback(async (values: RouteFormValues) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSavingRoute(true);
    try {
      await saveRoute(selectedRoute?.id ?? null, values);
      setModalOpen(false);
      setSelectedRoute(null);
      showToast(selectedRoute ? 'მარშრუტი წარმატებით განახლდა.' : 'ახალი მარშრუტი დაემატა.', 'success');
    } catch (error) {
      if (error instanceof Error && /sign in|permission|account role|only edit/i.test(error.message)) {
        showToast('მართვისთვის შედი სისტემაში მძღოლის ან კომპანიის ანგარიშით.', 'error');
      }
      throw error;
    } finally {
      savingRef.current = false;
      setSavingRoute(false);
    }
  }, [saveRoute, selectedRoute, showToast]);

  const handleRouteAction = useCallback(async (action: RouteAction) => {
    const route = usePlatformStore.getState().routes.find((item) => item.id === action.routeId);
    if (!route) return;

    if (action.type === 'edit') {
      setSelectedRoute(route);
      setModalOpen(true);
      return;
    }

    if (action.type === 'delete') {
      const accepted = window.confirm(`წავშალოთ მარშრუტი ${route.from} — ${route.to}?`);
      if (!accepted) return;
      try {
        await deleteRoute(action.routeId);
        showToast('მარშრუტი წაიშალა.', 'info');
      } catch (error) {
        showToast(error instanceof Error && error.message.includes('sign in') ? 'წასაშლელად საჭიროა ავტორიზაცია.' : 'მარშრუტის წაშლა ვერ მოხერხდა ან ჯავშნები უკვე არსებობს.', 'error');
      }
      return;
    }

    if (action.type === 'book') {
      if (bookingLock.current.has(route.id)) return;
      if (route.seatsAvailable <= 0) {
        showToast('ამ რეისზე თავისუფალი ადგილები აღარ არის.', 'error');
        return;
      }
      bookingLock.current.add(route.id);
      setPendingRouteId(route.id);
      try {
        await bookRoute(route.id);
        showToast(`${route.from} — ${route.to}: ჯავშანი წარმატებით შეიქმნა.`, 'success');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'ჯავშნის შექმნა ვერ მოხერხდა.';
        showToast(message.includes('Insufficient wallet balance') ? 'ბალანსი არასაკმარისია — ჯერ გახსენი საფულე და შეავსე სატესტო ბალანსი.' : message, 'error');
      } finally {
        bookingLock.current.delete(route.id);
        setPendingRouteId(null);
      }
    }
  }, [bookRoute, deleteRoute, showToast]);


  return (
    <main className="page-content">
      <section className="page-heading" aria-labelledby="routes-heading">
        <div>
          <div className="breadcrumb"><span>სამუშაო სივრცე</span><span aria-hidden="true">/</span><strong>მიმოხილვა</strong></div>
          <p className="eyebrow">კვირის მიმოხილვა <span className="live-indicator"><span /> ცოცხალი მონაცემები</span></p>
          <h1 id="routes-heading">გამარჯობა <span className="wave" aria-hidden="true">✳</span></h1>
          <p className="page-heading__description">მართე მარშრუტები და დააკვირდი მიმდინარე ჯავშნებს ერთ სივრცეში.</p>
        </div>
        <div className="page-heading__actions">
          <button type="button" className="button button--soft" onClick={() => { setQuery(''); setAvailabilityFilter('all'); setFromFilter(''); setToFilter(''); setDateFilter(''); setMaxPriceFilter(''); }}><ArrowDownUp size={16} /> ფილტრების გასუფთავება</button>
          {canCreateRoutes ? (
            <button type="button" className="button button--primary" onClick={openCreateModal}><CirclePlus size={17} /> ახალი მარშრუტი</button>
          ) : user ? (
            <span className="role-hint">მარშრუტების დასამატებლად საჭიროა მძღოლის ან კომპანიის როლი.</span>
          ) : (
            <Link className="button button--primary" to="/register" state={{ defaultRole: 'driver' }}><CirclePlus size={17} /> გახდი გადამზიდი</Link>
          )}
        </div>
      </section>

      {(dataSource !== 'api' || sourceMessage) && (
        <div className="demo-banner" role="status"><span className="demo-banner__signal" /><span><strong>ლოკალური დემო რეჟიმი</strong> — {sourceMessage || 'ნაჩვენებია ადგილობრივად შენახული მონაცემები.'}</span><ShieldCheck size={17} /></div>
      )}

      <section className="stats-grid" aria-label="ძირითადი სტატისტიკა">
        <StatCard label="აქტიური მარშრუტები" value={String(stats.activeCount).padStart(2, '0')} detail="რეისები, სადაც ადგილებია დარჩენილი" trend="მიმდინარე" icon={MapPinned} tone="teal" />
        <StatCard label="დადასტურებული ჯავშნები" value={String(stats.bookingCount).padStart(2, '0')} detail="შენახული ჯავშნების რაოდენობა" icon={PackageCheck} tone="blue" />
        <StatCard label="შევსებული რეისები" value={String(stats.fullCount).padStart(2, '0')} detail="რეისები, სადაც ადგილი აღარ არის" icon={Users} tone="amber" />
        <StatCard label="საშუალო ფასი" value={`${stats.averagePrice} ₾`} detail={`სულ ${stats.potentialRevenue.toLocaleString('ka-GE')} ₾ თავისუფალი ადგილების პოტენციალი`} icon={WalletCards} tone="violet" />
      </section>

      <RouteMap routes={visibleRoutes} />

      <section className="routes-section" aria-labelledby="route-list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">მოძებნე შენი შემდეგი რეისი</p>
            <h2 id="route-list-heading">მარშრუტების მართვა</h2>
            <p>ნახე, დაარედაქტირე ან დაჯავშნე ხელმისაწვდომი მარშრუტები.</p>
          </div>
          <span className="section-heading__count"><CarFront size={15} /> {visibleRoutes.length} მარშრუტი</span>
        </div>

        <div className="route-toolbar">
          <label className="search-field" htmlFor="route-search">
            <Search size={18} />
            <input id="route-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="მოძებნე ქალაქი, მძღოლი ან მანქანა..." autoComplete="off" />
            {query && <button type="button" className="search-field__clear" onClick={() => setQuery('')} aria-label="ძიების გასუფთავება">×</button>}
          </label>
          <label className="filter-select"><Filter size={16} /><span className="sr-only">ხელმისაწვდომობის ფილტრი</span><select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}><option value="all">ყველა მარშრუტი</option><option value="available">ხელმისაწვდომი</option><option value="full">შევსებული რეისები</option></select></label>
          <button type="button" className={`button button--soft advanced-filters-toggle${filterPanelOpen ? ' is-active' : ''}`} aria-expanded={filterPanelOpen} aria-controls="route-advanced-filters" onClick={() => setFilterPanelOpen((open) => !open)}><SlidersHorizontal size={16} /> დამატებითი ფილტრები</button>
          <span className="search-debounce-note"><span /> ძიება ოპტიმიზებულია</span>
        </div>

        {filterPanelOpen && (
          <form id="route-advanced-filters" className="advanced-filters" onSubmit={(event) => event.preventDefault()}>
            <label><span>საიდან</span><input value={fromFilter} onChange={(event) => setFromFilter(event.target.value)} placeholder="გამგზავრების ქალაქი" /></label>
            <label><span>სადამდე</span><input value={toFilter} onChange={(event) => setToFilter(event.target.value)} placeholder="დანიშნულების ქალაქი" /></label>
            <label><span>გამგზავრების თარიღი</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
            <label><span>მაქსიმალური ფასი (₾)</span><input type="number" min="1" max="100000" step="1" value={maxPriceFilter} onChange={(event) => setMaxPriceFilter(event.target.value)} placeholder="მაგ. 40" /></label>
          </form>
        )}

        <RouteList routes={visibleRoutes} loading={loading} pendingRouteId={pendingRouteId} onAction={handleRouteAction} canManageRoute={canManageRoute} />
        <div className="routes-section__footnote"><span><CalendarDays size={14} /> განახლდა {formatDate(new Date().toISOString().slice(0, 10))}</span><a href="/about">როგორ მუშაობს პლატფორმა <ArrowRight size={14} /></a></div>
      </section>

      <RouteFormModal isOpen={modalOpen} route={selectedRoute} saving={savingRoute} onClose={closeModal} onSave={handleSaveRoute} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </main>
  );
}
