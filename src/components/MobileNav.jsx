import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, ShieldAlert, Scale,
  AlertOctagon, FileSpreadsheet, TrendingUp, Zap,
  ShoppingBag, Menu, X,
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/storefront', icon: ShoppingBag, label: 'Storefront' },
  { to: '/checkout', icon: GraduationCap, label: 'Training Studio' },
  { to: '/fraud', icon: ShieldAlert, label: 'Fraud Layer' },
  { to: '/reconciliation', icon: Scale, label: 'Reconciliation' },
  { to: '/exceptions', icon: AlertOctagon, label: 'Exceptions' },
  { to: '/erp', icon: FileSpreadsheet, label: 'ERP Simulator' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar — visible on mobile only */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">PayOps</div>
            <div className="text-xs text-slate-500 leading-tight">Control Tower</div>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={clsx(
          'md:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">PayOps</div>
              <div className="text-xs text-slate-500 leading-tight">Control Tower</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
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
      </div>
    </>
  );
}
