import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 960px)');
  const toggleMenu = useCallback(() => setMobileMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="app-shell">
      <Header mobileMenuOpen={mobileMenuOpen} onToggleMenu={toggleMenu} />
      <div className="app-shell__body">
        {isMobile && mobileMenuOpen && <button className="sidebar-overlay" type="button" aria-label="მენიუს დახურვა" onClick={closeMenu} />}
        <Sidebar mobileOpen={mobileMenuOpen} onNavigate={closeMenu} />
        <div className="app-shell__content">
          <Outlet />
          <footer className="app-footer">
            <span>© 2026 გზა. ლოჯისტიკა მარტივად.</span>
            <span className="app-footer__links"><a href="/about">პლატფორმის შესახებ</a><a href="mailto:hello@gza.example">დახმარება</a></span>
          </footer>
        </div>
      </div>
    </div>
  );
}
