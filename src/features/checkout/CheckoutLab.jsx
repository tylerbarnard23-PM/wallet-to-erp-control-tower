import { useState } from 'react';
import { RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext, defaultConfig } from '../../context/AppContext';
import { calculateMetrics } from '../../services/metricsService';
import Toggle from '../../components/Toggle';
import SectionHeader from '../../components/SectionHeader';
import CheckoutPreview from './CheckoutPreview';
import { fmt } from '../../utils/formatters';

const DEVICES = [
  { value: 'mobile', label: 'Mobile (iOS)' },
  { value: 'android', label: 'Mobile (Android)' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
];

function DeltaChip({ value, label, format = 'ppt' }) {
  if (Math.abs(value) < 0.001) return null;
  const positive = value > 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border ${
      positive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
    }`}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? '+' : ''}{(value * 100).toFixed(1)}pp {label}
    </div>
  );
}

export default function CheckoutLab() {
  const { config, toggle, set, reset } = useAppContext();
  const [lastPaid, setLastPaid] = useState(null);

  const metrics = calculateMetrics(config);
  const baseMetrics = calculateMetrics(defaultConfig);

  return (
    <div className="p-6">
      <SectionHeader
        title="Checkout Experience Lab"
        subtitle="Modify checkout behavior and observe impact on capture rate, fraud, and reconciliation"
        actions={
          <button className="btn-secondary flex items-center gap-2" onClick={reset}>
            <RotateCcw size={14} />
            Reset to default
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Config panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-200">Wallet Configuration</div>
            </div>
            <div className="card-body space-y-4">
              <Toggle
                checked={config.expressWalletFirst}
                onChange={() => toggle('expressWalletFirst')}
                label="Express Wallet First"
                description="Show Apple Pay / Google Pay above card form"
              />
              <div>
                <div className="text-sm font-medium text-slate-200 mb-2">Device / Browser Simulation</div>
                <div className="grid grid-cols-2 gap-2">
                  {DEVICES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => set('deviceSimulation', d.value)}
                      className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                        config.deviceSimulation === d.value
                          ? 'bg-blue-600/20 border-blue-600/40 text-blue-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-200">Trust & Transparency</div>
            </div>
            <div className="card-body space-y-4">
              <Toggle
                checked={config.showTrustMessaging}
                onChange={() => toggle('showTrustMessaging')}
                label="Show Trust Messaging"
                description="Display SSL badges and security copy"
              />
              <Toggle
                checked={config.showFeesEarly}
                onChange={() => toggle('showFeesEarly')}
                label="Show Processing Fee Early"
                description="Disclose 2.9% + $0.30 in order summary"
              />
              <Toggle
                checked={config.showPromoCode}
                onChange={() => toggle('showPromoCode')}
                label="Show Promo Code Field"
                description="Visible promo entry on checkout page"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-200">Fraud Prevention</div>
            </div>
            <div className="card-body">
              <Toggle
                checked={config.requireBillingAddress}
                onChange={() => toggle('requireBillingAddress')}
                label="Require Billing Address"
                description="Enables AVS check — reduces fraud, adds friction"
              />
            </div>
          </div>

          {/* Impact preview */}
          <div className="card border-blue-600/20 bg-blue-600/5">
            <div className="card-header">
              <div className="text-sm font-semibold text-blue-400">Live Impact vs. Baseline</div>
            </div>
            <div className="card-body space-y-2">
              {[
                { key: 'captureRate', label: 'Capture Rate' },
                { key: 'walletAdoption', label: 'Wallet Adoption' },
                { key: 'fraudApprovalRate', label: 'Fraud Approval' },
                { key: 'reconMatchRate', label: 'Recon Match' },
                { key: 'erpPostingSuccess', label: 'ERP Posting' },
              ].map(({ key, label }) => {
                const delta = metrics[key] - baseMetrics[key];
                const abs = Math.abs(delta);
                if (abs < 0.001) return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-600">no change</span>
                  </div>
                );
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className={delta > 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}pp
                    </span>
                  </div>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Recovered Revenue</span>
                <span className={metrics.recoveredRevenue > baseMetrics.recoveredRevenue ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {metrics.recoveredRevenue > baseMetrics.recoveredRevenue ? '+' : ''}
                  {fmt.compact(metrics.recoveredRevenue - baseMetrics.recoveredRevenue)}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout preview */}
        <div className="xl:col-span-3">
          <CheckoutPreview config={config} onPay={(method) => setLastPaid(method)} />
          {lastPaid && (
            <div className="mt-3 card border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Demo payment initiated via {lastPaid} — no real transaction processed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
