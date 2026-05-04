import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 overflow-auto bg-slate-950 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
