import { Bell, LogIn, LogOut, MapPinned, Menu, PackageCheck, Search, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { usePlatformStore } from '../store/usePlatformStore';

interface HeaderProps {
  mobileMenuOpen: boolean;
  onToggleMenu: () => void;
}

export function Header({ mobileMenuOpen, onToggleMenu }: HeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const routesCount = usePlatformStore((state) => state.routes.length);
  const bookingsCount = usePlatformStore((state) => state.bookings.length);
  const focusSearch = () => {
    navigate('/routes');
    window.setTimeout(() => document.getElementById('route-search')?.focus(), 60);
  };

  return (
    <header className="topbar">
      <div className="topbar__brand-area">
        <button aria-label={mobileMenuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'} aria-expanded={mobileMenuOpen} className="icon-button topbar__menu-button" onClick={onToggleMenu} type="button">
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <a className="brand" href="/" aria-label="გზა — მთავარ გვერდზე გადასვლა"><span className="brand__mark" aria-hidden="true"><span /></span><span className="brand__name">გზა<span>.</span></span></a>
        <span className="topbar__divider" />
        <span className="topbar__workspace">ტრანსპორტის მართვა</span>
      </div>

      <div className="topbar__actions">
        <button className="icon-button topbar__search-shortcut" type="button" aria-label="ძებნაზე გადასვლა" onClick={focusSearch}><Search size={19} /></button>
        <button className="topbar__route-count" type="button" onClick={() => navigate('/routes')} aria-label={`${routesCount} მარშრუტი`} title="მარშრუტების რაოდენობა"><MapPinned size={18} /><span>{routesCount}</span></button>
        <button className="topbar__booking-count" type="button" onClick={() => navigate('/bookings')} aria-label={`${bookingsCount} ჯავშანი`} title="ჩემი ჯავშნები"><PackageCheck size={18} /><span>{bookingsCount}</span></button>
        <span className="icon-button topbar__notification" aria-hidden="true"><Bell size={19} /><span className="notification-dot" /></span>
        {user ? (
          <div className="profile-chip" aria-label={`შესულია ${user.fullName}`}>
            <span className="avatar">{user.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</span>
            <span className="profile-chip__text"><strong>{user.fullName}</strong><small>{user.role === 'company' ? 'კომპანია' : user.role === 'driver' ? 'მძღოლი' : user.role === 'admin' ? 'ადმინისტრატორი' : 'მგზავრი'}</small></span>
            <button className="profile-logout" type="button" onClick={() => { signOut(); navigate('/'); }} aria-label="სისტემიდან გამოსვლა" title="გამოსვლა"><LogOut size={16} /></button>
          </div>
        ) : (
          <div className="topbar__auth-actions"><button className="button button--ghost button--small" type="button" onClick={() => navigate('/login')}><LogIn size={15} /> შესვლა</button><button className="button button--primary button--small topbar__register" type="button" onClick={() => navigate('/register')}><UserPlus size={15} /> რეგისტრაცია</button></div>
        )}
      </div>
    </header>
  );
}
