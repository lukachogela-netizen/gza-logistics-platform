import { useEffect, useState } from 'react';
import { Building2, CalendarCheck, CircleAlert, MapPinned, ShieldCheck, Truck, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { apiRequest } from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { usePlatformStore } from '../store/usePlatformStore';
import type { UserRole } from '../types';

interface RoleDashboardPageProps {
  role: Extract<UserRole, 'driver' | 'company'>;
}

interface DashboardStats {
  routeCount: number;
  availableRouteCount: number;
  openSeats: number;
  bookingCount: number;
}

const emptyStats: DashboardStats = { routeCount: 0, availableRouteCount: 0, openSeats: 0, bookingCount: 0 };

export function RoleDashboardPage({ role }: RoleDashboardPageProps) {
  const user = useAuthStore((state) => state.user);
  const initialize = usePlatformStore((state) => state.initialize);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [localFallback, setLocalFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isDriver = role === 'driver';
  const title = isDriver ? 'მძღოლის სივრცე' : 'კომპანიის სივრცე';

  useEffect(() => {
    let active = true;
    const load = async () => {
      await initialize();
      try {
        const result = await apiRequest<DashboardStats>('/dashboard/stats');
        if (active) {
          setStats(result);
          setLocalFallback(false);
          setErrorMessage('');
        }
      } catch (error) {
        const state = usePlatformStore.getState();
        const ownedRoutes = state.routes.filter((route) => user?.role === 'admin' || route.ownerId === user?.id);
        if (active) {
          setStats({
            routeCount: ownedRoutes.length,
            availableRouteCount: ownedRoutes.filter((route) => route.seatsAvailable > 0).length,
            openSeats: ownedRoutes.reduce((total, route) => total + route.seatsAvailable, 0),
            bookingCount: state.bookings.filter((booking) => ownedRoutes.some((route) => route.id === booking.routeId)).length,
          });
          setLocalFallback(true);
          setErrorMessage(error instanceof Error ? error.message : 'API მიუწვდომელია. ნაჩვენებია ლოკალური მონაცემები.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [initialize, user?.id, user?.role]);

  return (
    <main className="page-content">
      <section className="page-heading" aria-labelledby="role-dashboard-heading">
        <div>
          <div className="breadcrumb"><span>მართვა</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
          <p className="eyebrow">საკონტროლო პანელი</p>
          <h1 id="role-dashboard-heading">{title}</h1>
          <p className="page-heading__description">{user?.companyName || user?.fullName || 'შენი ანგარიშის'} სამუშაო მაჩვენებლები და მარშრუტების მართვა.</p>
        </div>
        <div className="page-heading__actions">
          <Link to="/wallet" className="button button--soft"><WalletCards size={16} /> საფულე</Link>
          <Link to="/routes" className="button button--primary"><MapPinned size={16} /> მარშრუტებზე გადასვლა</Link>
        </div>
      </section>

      {localFallback && <div className="demo-banner" role="status"><span className="demo-banner__signal" /><span><strong>ლოკალური დემო რეჟიმი</strong> — {errorMessage || 'სტატისტიკა დათვლილია ამ ბრაუზერის შენახული მონაცემებიდან.'}</span><CircleAlert size={17} /></div>}

      {loading ? (
        <div className="stats-grid" aria-label="სტატისტიკა იტვირთება">{[1, 2, 3, 4].map((item) => <div className="route-skeleton role-stat-skeleton" key={item}><span /><span /><span /></div>)}</div>
      ) : (
        <section className="stats-grid" aria-label={`${title} სტატისტიკა`}>
          <StatCard label="მარშრუტების რაოდენობა" value={String(stats.routeCount).padStart(2, '0')} detail="შენი მართვის ქვეშ მყოფი რეისები" icon={MapPinned} tone="teal" />
          <StatCard label="აქტიური მარშრუტები" value={String(stats.availableRouteCount).padStart(2, '0')} detail="რეისები, სადაც ადგილებია დარჩენილი" icon={Truck} tone="blue" />
          <StatCard label="თავისუფალი ადგილები" value={String(stats.openSeats).padStart(2, '0')} detail="ყველა აქტიური რეისის ჯამი" icon={Users} tone="amber" />
          <StatCard label="ჯავშნები" value={String(stats.bookingCount).padStart(2, '0')} detail="შენს მარშრუტებზე შექმნილი ჯავშნები" icon={CalendarCheck} tone="violet" />
        </section>
      )}

      <section className="role-panel role-panel--dashboard">
        <span className="role-panel__icon">{isDriver ? <Truck size={25} /> : <Building2 size={25} />}</span>
        <h2>{isDriver ? 'მართე საკუთარი რეისები' : 'მართე კომპანიის ტრანსპორტი'}</h2>
        <p>{isDriver ? 'შექმენი მარშრუტი, განაახლე თავისუფალი ადგილები და შეამოწმე რეისის ჯავშნები.' : 'დაამატე კომპანიის სახელით მარშრუტები, აკონტროლე ხელმისაწვდომობა და ნახე ტრანსპორტირების აქტივობა.'}</p>
        <div className="role-panel__status"><ShieldCheck size={16} /> დაცული გვერდი · როლზე დაფუძნებული წვდომა</div>
        <div className="role-panel__actions"><Link to="/routes" className="button button--primary">მარშრუტების მართვა</Link><Link to="/bookings" className="button button--soft">ჯავშნების ნახვა</Link></div>
      </section>
    </main>
  );
}
