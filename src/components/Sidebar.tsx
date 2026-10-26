import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, Box, CalendarCheck, CircleHelp, LayoutDashboard, MapPinned, Settings2, Truck, Users, WalletCards } from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onNavigate?: () => void;
}

const primaryItems = [
  { to: '/', label: 'მიმოხილვა', icon: LayoutDashboard, end: true },
  { to: '/routes', label: 'მარშრუტები', icon: MapPinned },
  { to: '/bookings', label: 'ჩემი ჯავშნები', icon: CalendarCheck },
];

const manageItems = [
  { to: '/dashboard/driver', label: 'მძღოლის სივრცე', icon: Truck },
  { to: '/dashboard/company', label: 'კომპანიის სივრცე', icon: Users },
  { to: '/about', label: 'პლატფორმის შესახებ', icon: CircleHelp },
];

export function Sidebar({ mobileOpen, onNavigate }: SidebarProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`} aria-label="მთავარი ნავიგაცია">
      <div className="sidebar__section-label">სამუშაო სივრცე</div>
      <nav className="sidebar__nav">
        {primaryItems.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`} {...rest}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {user && <nav className="sidebar__nav sidebar__nav--wallet" aria-label="ანგარიში"><NavLink to="/wallet" onClick={onNavigate} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}><WalletCards size={18} strokeWidth={1.9} /><span>საფულე და ბალანსი</span></NavLink></nav>}

      <div className="sidebar__section-label sidebar__section-label--spaced">მართვა</div>
      <nav className="sidebar__nav">
        {manageItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__help-card">
          <span className="sidebar__help-icon"><Activity size={18} /></span>
          <strong>ყველაფერი კონტროლშია</strong>
          <p>მართე რეისები და ჯავშნები ერთი სივრციდან.</p>
          <NavLink to="/about" onClick={onNavigate}>გაიგე მეტი <span aria-hidden="true">→</span></NavLink>
        </div>
        <div className="sidebar__footer-line"><Box size={15} /><span>დემო ვერსია · v1.0</span><Settings2 size={15} /></div>
      </div>
    </aside>
  );
}
