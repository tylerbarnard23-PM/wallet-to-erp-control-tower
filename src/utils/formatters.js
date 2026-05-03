export const fmt = {
  currency: (v, decimals = 2) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals }).format(v),

  pct: (v, decimals = 1) => `${(v * 100).toFixed(decimals)}%`,

  pctDelta: (v, decimals = 1) => {
    const s = (v * 100).toFixed(decimals);
    return v >= 0 ? `+${s}%` : `${s}%`;
  },

  number: (v) => new Intl.NumberFormat('en-US').format(v),

  compact: (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  },

  date: (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),

  time: (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),

  datetime: (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },
};

export function riskColor(score) {
  if (score < 30) return 'emerald';
  if (score < 60) return 'amber';
  return 'red';
}

export function riskLabel(score) {
  if (score < 30) return 'Low';
  if (score < 60) return 'Medium';
  return 'High';
}

export function decisionBadge(decision) {
  switch (decision) {
    case 'approved': return 'badge-green';
    case 'review': return 'badge-amber';
    case 'declined': return 'badge-red';
    default: return 'badge-slate';
  }
}

export function statusBadge(status) {
  switch (status) {
    case 'matched': case 'posted': case 'captured': case 'authorized': return 'badge-green';
    case 'review': case 'pending_review': case 'mismatch': case 'ready': return 'badge-amber';
    case 'declined': case 'failed': case 'missing': case 'exception': case 'chargeback': return 'badge-red';
    case 'duplicate': return 'badge-purple';
    case 'refunded': return 'badge-blue';
    default: return 'badge-slate';
  }
}
