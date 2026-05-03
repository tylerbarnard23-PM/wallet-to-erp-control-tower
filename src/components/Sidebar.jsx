import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShieldAlert, Scale,
  AlertOctagon, FileSpreadsheet, TrendingUp, Zap,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/checkout', icon: ShoppingCart, label: 'Checkout Lab' },
  { to: '/fraud', icon: ShieldAlert, label: 'Fraud Layer' },
  { to: '/reconciliation', icon: Scale, label: 'Reconciliation' },
  { to: '/exceptions', icon: AlertOctagon, label: 'Exceptions' },
  { to: '/erp', icon: FileSpreadsheet, label: 'ERP Simulator' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">PayOps</div>
            <div className="text-xs text-slate-500 leading-tight">Control Tower</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            D
          </div>
          <div>
            <div className="text-xs font-medium text-slate-300">Demo Mode</div>
            <div className="text-xs text-slate-500">Synthetic data only</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
