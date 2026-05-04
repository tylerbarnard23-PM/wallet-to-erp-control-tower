import {
  CreditCard, Wallet, ShieldCheck, Scale,
  FileSpreadsheet, Clock, DollarSign, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { calculateMetrics, getVolumeTimeSeries, getDailyExceptions } from '../../services/metricsService';
import MetricCard from '../../components/MetricCard';
import SectionHeader from '../../components/SectionHeader';
import { fmt } from '../../utils/formatters';

const WALLET_SPLIT = [
  { name: 'Apple Pay', value: 31, color: '#818cf8' },
  { name: 'Google Pay', value: 26, color: '#34d399' },
  { name: 'Credit Card', value: 33, color: '#60a5fa' },
  { name: 'Debit Card', value: 10, color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-medium text-slate-300 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {fmt.compact(p.value)}
        </div>
      ))}
    </div>
  );
};

const ExceptionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-medium text-slate-300 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { config, selectedProduct } = useAppContext();
  const m = calculateMetrics(config, selectedProduct?.category);
  const volumeData = getVolumeTimeSeries();
  const exceptionData = getDailyExceptions();

  return (
    <div className="p-6">
      <SectionHeader
        title="Payment Operations Dashboard"
        subtitle="Real-time overview · 72-hour rolling window · Demo data"
        actions={
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live simulation
          </div>
        }
      />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <MetricCard
          title="Checkout Capture Rate"
          value={m.captureRate}
          delta={m.deltas.captureRate}
          format="pct"
          icon={CreditCard}
          subtitle="Orders that completed payment"
          tooltip={{
            what: 'Percentage of checkout sessions that ended in a successfully captured payment.',
            drivers: [
              'Express Wallet First — reduces tap count, lifts conversions',
              'Show Trust Messaging — SSL badge increases buyer confidence',
              'Show Fees Early — fee disclosure can increase abandonment',
              'Require Billing Address — adds friction, slight drop in completion',
              'Promo Code visible — sets higher expectations, minor lift',
            ],
            note: 'Delta shown vs. baseline config. Green = improvement over default.',
          }}
        />
        <MetricCard
          title="Wallet Adoption"
          value={m.walletAdoption}
          delta={m.deltas.walletAdoption}
          format="pct"
          icon={Wallet}
          iconColor="text-purple-400"
          subtitle="Apple Pay + Google Pay share"
          tooltip={{
            what: 'Share of captured payments made via a digital wallet (Apple Pay or Google Pay) vs. manual card entry.',
            drivers: [
              'Express Wallet First — wallet buttons above the fold see far higher click rates',
              'Device type — iOS and Android devices have wallet eligibility; desktop does not',
            ],
            note: 'Higher wallet share directly reduces fraud risk due to tokenization.',
          }}
        />
        <MetricCard
          title="Fraud Approval Rate"
          value={m.fraudApprovalRate}
          delta={m.deltas.fraudApprovalRate}
          format="pct"
          icon={ShieldCheck}
          iconColor="text-emerald-400"
          subtitle="Auto-approved transactions"
          tooltip={{
            what: 'Percentage of transactions automatically approved by the fraud engine without requiring manual review.',
            drivers: [
              'Wallet adoption — tokenized payments carry lower risk scores (no raw PAN exposed)',
              'Require Billing Address — AVS match reduces false positives on legitimate orders',
            ],
            note: 'A higher rate means fewer transactions stuck in manual review queues.',
          }}
        />
        <MetricCard
          title="Recon Match Rate"
          value={m.reconMatchRate}
          delta={m.deltas.reconMatchRate}
          format="pct"
          icon={Scale}
          iconColor="text-amber-400"
          subtitle="Exact matches this period"
          tooltip={{
            what: 'Percentage of transactions where the internal order amount, processor settlement, and bank deposit all agree exactly.',
            drivers: [
              'Fraud approval rate — declined or disputed transactions create exceptions',
              'Fewer chargebacks (driven by wallet tokenization) means fewer recon breaks',
            ],
            note: 'Unmatched records land in the Exception Queue and block ERP auto-posting.',
          }}
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="ERP Posting Success"
          value={m.erpPostingSuccess}
          delta={m.deltas.erpPostingSuccess}
          format="pct"
          icon={FileSpreadsheet}
          iconColor="text-indigo-400"
          subtitle="Auto-posted journal entries"
          tooltip={{
            what: 'Percentage of transactions whose journal entries were automatically posted to the GL without requiring manual intervention.',
            drivers: [
              'Reconciliation match rate — only clean-matched records auto-post',
              'Exception volume — each unresolved exception blocks its ERP entry',
            ],
            note: 'Failed postings delay the month-end close and require analyst time to correct.',
          }}
        />
        <MetricCard
          title="Manual Hours Saved"
          value={m.manualHoursSaved}
          format="number"
          icon={Clock}
          iconColor="text-sky-400"
          subtitle="Per week vs. no automation"
          tooltip={{
            what: 'Estimated analyst hours per week saved by automated reconciliation and ERP posting, compared to a fully manual process.',
            drivers: [
              'Capture rate — more successful payments means more volume handled automatically',
              'Recon match rate — every exception adds ~25 min of analyst investigation time',
            ],
            note: 'Assumes 40-person payments ops team; your mileage will vary.',
          }}
        />
        <MetricCard
          title="Est. Recovered Revenue"
          value={m.recoveredRevenue}
          format="currency"
          icon={DollarSign}
          iconColor="text-emerald-400"
          subtitle="Per month from retry & match"
          tooltip={{
            what: 'Estimated monthly revenue recovered through improved checkout conversion, automated exception resolution, and chargeback dispute wins.',
            drivers: [
              'Capture rate delta — each +1pp captures ~$18K more revenue per month',
              'Recon match rate delta — each +1pp reduces chargeback losses ~$9.5K/mo',
            ],
            note: 'Based on $1.8M average monthly volume. Adjust in metricsService.js.',
          }}
        />
        <MetricCard
          title="Processing Volume"
          value={4_280_000}
          format="currency"
          icon={TrendingUp}
          iconColor="text-blue-400"
          subtitle="72-hour gross capture"
          tooltip={{
            what: 'Total gross payment volume captured in the current 72-hour rolling window, across all payment methods.',
            drivers: [
              'Sum of all captured transaction amounts before processor fees',
              'Excludes declined, pending-review, and refunded transactions',
            ],
            note: 'Static in this demo. In production this updates every 15 minutes.',
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Volume Chart */}
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Payment Volume — 30 Days</div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Wallet</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />Card</span>
            </div>
          </div>
          <div className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="wallet" name="Wallet" stackId="1" stroke="#3b82f6" fill="url(#walletGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="card" name="Card" stackId="1" stroke="#475569" fill="url(#cardGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wallet Split */}
        <div className="card">
          <div className="card-header">
            <div className="text-sm font-semibold text-slate-200">Payment Method Mix</div>
          </div>
          <div className="p-4">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={WALLET_SPLIT} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value">
                    {WALLET_SPLIT.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {WALLET_SPLIT.map((e) => (
                <div key={e.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    {e.name}
                  </div>
                  <div className="font-medium text-slate-300">{e.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exception chart */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Daily Exception Volume — 14 Days</div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70 inline-block" />Mismatch</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" />Missing</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500/70 inline-block" />Duplicate</span>
          </div>
        </div>
        <div className="p-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={exceptionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ExceptionTooltip />} />
              <Bar dataKey="mismatch" name="Mismatch" stackId="a" fill="#f59e0b" opacity={0.75} radius={[0, 0, 0, 0]} />
              <Bar dataKey="missing" name="Missing" stackId="a" fill="#ef4444" opacity={0.75} />
              <Bar dataKey="duplicate" name="Duplicate" stackId="a" fill="#a78bfa" opacity={0.75} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Config Impact Banner */}
      {Object.values(m.deltas).some((d) => Math.abs(d) > 0.001) && (
        <div className="mt-4 card border-blue-600/30 bg-blue-600/5 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-400">
            <TrendingUp size={14} />
            Checkout config is affecting these metrics vs. baseline
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            {Math.abs(m.deltas.captureRate) > 0.001 && (
              <span>Capture rate: <span className={m.deltas.captureRate > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt.pctDelta(m.deltas.captureRate)}</span></span>
            )}
            {Math.abs(m.deltas.walletAdoption) > 0.001 && (
              <span>Wallet adoption: <span className={m.deltas.walletAdoption > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt.pctDelta(m.deltas.walletAdoption)}</span></span>
            )}
            {Math.abs(m.deltas.fraudApprovalRate) > 0.001 && (
              <span>Fraud approval: <span className={m.deltas.fraudApprovalRate > 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt.pctDelta(m.deltas.fraudApprovalRate)}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
