import { Outlet } from 'react-router-dom';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-body">
      <main className="pb-24">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}