import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { fmt } from '../utils/formatters';
import InfoTooltip from './InfoTooltip';

export default function MetricCard({ title, value, delta, format = 'pct', icon: Icon, iconColor = 'text-blue-400', subtitle, tooltip }) {
  const formatted = format === 'pct' ? fmt.pct(value)
    : format === 'currency' ? fmt.compact(value)
    : format === 'number' ? fmt.number(value)
    : value;

  const deltaPct = delta != null ? (format === 'pct' ? delta * 100 : delta) : null;
  const isPositive = deltaPct > 0.005;
  const isNegative = deltaPct < -0.005;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-medium text-slate-400">{title}</div>
          {tooltip && <InfoTooltip {...tooltip} />}
        </div>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800', iconColor)}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-3">
        <div className="text-2xl font-semibold text-slate-100">{formatted}</div>
        {deltaPct != null && Math.abs(deltaPct) > 0.005 && (
          <div className={clsx('flex items-center gap-0.5 text-xs font-medium mb-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{deltaPct.toFixed(1)}
            {format === 'pct' ? 'pp' : ''}
          </div>
        )}
      </div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}
