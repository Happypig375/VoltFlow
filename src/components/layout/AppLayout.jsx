import { Outlet, useLocation } from 'react-router-dom';
import MobileNav from './MobileNav';

export default function AppLayout() {
  const location = useLocation();
  const isMapRoute = location.pathname === '/';

  return (
    <div className="min-h-dvh bg-background font-body [--mobile-nav-height:5rem]">
      <main className={isMapRoute ? 'h-[calc(100dvh-var(--mobile-nav-height))] overflow-hidden' : 'pb-[calc(var(--mobile-nav-height)+1rem)]'}>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}