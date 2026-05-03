import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppContext, defaultConfig } from '../../context/AppContext';
import { calculateMetrics, getVolumeTimeSeries } from '../../services/metricsService';
import SectionHeader from '../../components/SectionHeader';
import { fmt } from '../../utils/formatters';

const FUNNEL_STEPS = [
  { step: 'Checkout Initiated', base: 10000 },
  { step: 'Wallet Eligible', base: 6200 },
  { step: 'Wallet Shown', base: 5800 },
  { step: 'Wallet Clicked', base: 4100 },
  { step: 'Authorization Sent', base: 3900 },
  { step: 'Authorization Approved', base: 3690 },
  { step: 'Capture Completed', base: 3650 },
];

function buildFunnel(config) {
  const m = calculateMetrics(config);
  const walletBoost = config.expressWalletFirst ? 1.15 : 1.0;
  const trustBoost = config.showTrustMessaging ? 1.02 : 1.0;
  const feeImpact = config.showFeesEarly ? 0.95 : 1.0;

  return FUNNEL_STEPS.map((s, i) => {
    const multiplier = i >= 2 ? walletBoost * trustBoost * feeImpact : 1.0;
    return {
      ...s,
      count: Math.round(s.base * multiplier),
      pct: i === 0 ? 100 : null,
    };
  }).map((s, i, arr) => ({
    ...s,
    pct: i === 0 ? 100 : Math.round((s.count / arr[0].count) * 100),
    dropOff: i > 0 ? arr[i - 1].count - s.count : 0,
  }));
}

function buildTrends(config) {
  const current = calculateMetrics(config);
  const baseline = calculateMetrics(defaultConfig);
  return Array.from({ length: 12 }, (_, i) => {
    const label = new Date(2026, i % 12, 1).toLocaleDateString('en-US', { month: 'short' });
    const progress = i / 11;
    return {
      label,
      captureRate: parseFloat((
        baseline.captureRate + (current.captureRate - baseline.captureRate) * progress + Math.sin(i * 0.5) * 0.005
      ).toFixed(4)),
      walletAdoption: parseFloat((
        baseline.walletAdoption + (current.walletAdoption - baseline.walletAdoption) * progress + Math.cos(i * 0.4) * 0.008
      ).toFixed(4)),
      fraudApproval: parseFloat((
        baseline.fraudApprovalRate + (current.fraudApprovalRate - baseline.fraudApprovalRate) * progress + Math.sin(i * 0.6) * 0.003
      ).toFixed(4)),
    };
  });
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-medium text-slate-300 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }} className="flex items-center justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono">{fmt.pct(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { config } = useAppContext();
  const current = calculateMetrics(config);
  const baseline = calculateMetrics(defaultConfig);
  const funnel = buildFunnel(config);
  const trends = buildTrends(config);
  const volumeData = getVolumeTimeSeries().slice(-14);

  const maxFunnel = funnel[0].count;

  return (
    <div className="p-6">
      <SectionHeader
        title="Payment Analytics"
        subtitle="How checkout configuration drives fraud, reconciliation, and ERP outcomes"
      />

      {/* Config impact table */}
      <div className="card mb-5 overflow-hidden">
        <div className="card-header">
          <div className="text-sm font-semibold text-slate-200">Current Config vs. Baseline Impact</div>
          <div className="text-xs text-slate-500 mt-0.5">Change config in the Checkout Lab to see metrics shift in real time</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Metric</th>
                <th className="text-right px-4 py-3 font-medium">Baseline</th>
                <th className="text-right px-4 py-3 font-medium">Current Config</th>
                <th className="text-right px-4 py-3 font-medium">Delta</th>
                <th className="text-left px-4 py-3 font-medium">Downstream Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { label: 'Capture Rate', key: 'captureRate', effect: 'Directly drives revenue recovery and ERP posting volume' },
                { label: 'Wallet Adoption', key: 'walletAdoption', effect: 'Tokenized payments reduce fraud score — fewer manual reviews' },
                { label: 'Fraud Approval Rate', key: 'fraudApprovalRate', effect: 'Higher approval → fewer chargebacks → better recon match rate' },
                { label: 'Recon Match Rate', key: 'reconMatchRate', effect: 'Fewer exceptions reduce analyst hours and ERP delays' },
                { label: 'ERP Posting Success', key: 'erpPostingSuccess', effect: 'Auto-posted entries reduce month-end close cycle time' },
              ].map(({ label, key, effect }) => {
                const delta = current[key] - baseline[key];
                const improved = delta > 0.001;
                const declined = delta < -0.001;
                return (
                  <tr key={key} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-200">{label}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">{fmt.pct(baseline[key])}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-200">{fmt.pct(current[key])}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${improved ? 'text-emerald-400' : declined ? 'text-red-400' : 'text-slate-500'}`}>
                      {delta > 0.001 ? '+' : ''}{delta < 0.001 && delta > -0.001 ? '—' : (delta * 100).toFixed(1) + 'pp'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{effect}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Funnel */}
        <div className="card">
          <div className="card-header text-sm font-semibold text-slate-200">Checkout Funnel</div>
          <div className="card-body space-y-2">
            {funnel.map((step, i) => (
              <div key={step.step}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-slate-400">{step.step}</span>
                  <div className="flex items-center gap-3">
                    {step.dropOff > 0 && <span className="text-red-400/70">-{step.dropOff.toLocaleString()}</span>}
                    <span className="text-slate-300 font-medium w-12 text-right">{step.count.toLocaleString()}</span>
                    <span className="text-slate-500 font-mono w-10 text-right">{step.pct}%</span>
                  </div>
                </div>
                <div className="h-6 bg-slate-800 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(step.count / maxFunnel) * 100}%`,
                      background: `linear-gradient(to right, ${
                        i === 0 ? '#3b82f6' :
                        i < 3 ? '#6366f1' :
                        i < 5 ? '#8b5cf6' : '#10b981'
                      }, ${
                        i === 0 ? '#60a5fa' :
                        i < 3 ? '#818cf8' :
                        i < 5 ? '#a78bfa' : '#34d399'
                      })`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="card">
          <div className="card-header text-sm font-semibold text-slate-200">Performance Trends — 12 Month Projection</div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  domain={[0.75, 1]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="captureRate" name="Capture Rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="walletAdoption" name="Wallet Adoption" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fraudApproval" name="Fraud Approval" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volume + exception trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-header text-sm font-semibold text-slate-200">Payment Volume — Last 14 Days</div>
          <div className="p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => fmt.compact(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" name="Total Volume" stroke="#3b82f6" fill="url(#walletGrad2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header text-sm font-semibold text-slate-200">Revenue Recovery Estimate</div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Baseline recovered revenue</span>
              <span className="font-bold text-slate-300">{fmt.compact(baseline.recoveredRevenue)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Current config estimate</span>
              <span className="font-bold text-slate-100">{fmt.compact(current.recoveredRevenue)}/mo</span>
            </div>
            <div className={`flex items-center justify-between border-t border-slate-800 pt-3 ${current.recoveredRevenue > baseline.recoveredRevenue ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="text-sm font-semibold">Net impact</span>
              <span className="text-xl font-bold">
                {current.recoveredRevenue > baseline.recoveredRevenue ? '+' : ''}
                {fmt.compact(current.recoveredRevenue - baseline.recoveredRevenue)}/mo
              </span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-400">
              <div>• Express wallet first reduces abandonment by reducing friction</div>
              <div>• Tokenized payments approve at higher rates → fewer lost sales</div>
              <div>• Better recon match rate reduces chargeback losses</div>
              <div>• Higher ERP auto-posting reduces manual error risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
