import { useState } from 'react';
import { RotateCcw, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext, defaultConfig } from '../../context/AppContext';
import { calculateMetrics } from '../../services/metricsService';
import Toggle from '../../components/Toggle';
import SectionHeader from '../../components/SectionHeader';
import CheckoutPreview from './CheckoutPreview';
import { fmt } from '../../utils/formatters';

const DEVICES = [
  { value: 'mobile',  label: '📱 iOS Mobile' },
  { value: 'android', label: '📱 Android' },
  { value: 'desktop', label: '🖥 Desktop' },
  { value: 'tablet',  label: '📲 Tablet' },
];

function ConfigSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        className="card-header w-full flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && <div className="card-body space-y-4">{children}</div>}
    </div>
  );
}

export default function CheckoutLab() {
  const { config, toggle, set, reset } = useAppContext();
  const [lastPaid, setLastPaid] = useState(null);

  const metrics = calculateMetrics(config);
  const baseMetrics = calculateMetrics(defaultConfig);

  const IMPACT_ROWS = [
    { key: 'captureRate',       label: 'Capture Rate' },
    { key: 'walletAdoption',    label: 'Wallet Adoption' },
    { key: 'fraudApprovalRate', label: 'Fraud Approval' },
    { key: 'reconMatchRate',    label: 'Recon Match' },
    { key: 'erpPostingSuccess', label: 'ERP Posting' },
  ];

  return (
    <div className="p-6">
      <SectionHeader
        title="Checkout Experience Lab"
        subtitle="Modify checkout behavior and observe the cascading impact on capture rate, fraud, reconciliation, and ERP"
        actions={
          <button className="btn-secondary flex items-center gap-2" onClick={reset}>
            <RotateCcw size={14} />
            Reset to default
          </button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Config panel */}
        <div className="xl:col-span-2 space-y-3">

          {/* Wallet */}
          <ConfigSection title="Wallet & Payment Methods">
            <Toggle
              checked={config.expressWalletFirst}
              onChange={() => toggle('expressWalletFirst')}
              label="Express Wallet First"
              description="Show Apple Pay / Google Pay above the card form"
            />
            <Toggle
              checked={config.savedCardEnabled}
              onChange={() => toggle('savedCardEnabled')}
              label="Saved Card / One-Click Pay"
              description="Show returning customers their saved payment method"
            />
            <Toggle
              checked={config.showPaymentIcons}
              onChange={() => toggle('showPaymentIcons')}
              label="Show Accepted Payment Icons"
              description="Display Visa, Mastercard, Amex, Discover logos"
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
          </ConfigSection>

          {/* Trust & Social Proof */}
          <ConfigSection title="Trust & Social Proof">
            <Toggle
              checked={config.showTrustMessaging}
              onChange={() => toggle('showTrustMessaging')}
              label="SSL / Security Badges"
              description="256-bit SSL, PCI DSS, and fraud protection copy"
            />
            <Toggle
              checked={config.showReviews}
              onChange={() => toggle('showReviews')}
              label="Social Proof — Reviews"
              description="Star rating and review count near the checkout header"
            />
            <Toggle
              checked={config.showScarcity}
              onChange={() => toggle('showScarcity')}
              label="Scarcity Indicator"
              description='"X people viewing · Y seats left at this price"'
            />
            <Toggle
              checked={config.showMoneyBack}
              onChange={() => toggle('showMoneyBack')}
              label="Money-Back Guarantee Badge"
              description="30-day full refund guarantee displayed prominently"
            />
          </ConfigSection>

          {/* Offer & Pricing */}
          <ConfigSection title="Offer & Pricing" defaultOpen={false}>
            <Toggle
              checked={config.showSavings}
              onChange={() => toggle('showSavings')}
              label="Show Savings Callout"
              description="Original price crossed out with savings amount highlighted"
            />
            <Toggle
              checked={config.showInstallments}
              onChange={() => toggle('showInstallments')}
              label="Installment Payment Option"
              description='"or 4 payments of $X" — BNPL-style split shown at checkout'
            />
            <Toggle
              checked={config.showFeesEarly}
              onChange={() => toggle('showFeesEarly')}
              label="Show Processing Fee Early"
              description="Disclose 2.9% + $0.30 in the order summary"
            />
            <Toggle
              checked={config.showPromoCode}
              onChange={() => toggle('showPromoCode')}
              label="Show Promo Code Field"
              description="Collapsible promo entry visible on the checkout page"
            />
          </ConfigSection>

          {/* Friction & Conversion */}
          <ConfigSection title="Friction & Conversion" defaultOpen={false}>
            <Toggle
              checked={config.guestCheckoutEnabled}
              onChange={() => toggle('guestCheckoutEnabled')}
              label="Allow Guest Checkout"
              description="Remove forced account creation — top cause of cart abandonment"
            />
            <Toggle
              checked={config.autoFillHints}
              onChange={() => toggle('autoFillHints')}
              label="Enable Browser Autofill"
              description="Add autocomplete hints so browsers pre-fill address and card fields"
            />
          </ConfigSection>

          {/* Fraud Prevention */}
          <ConfigSection title="Fraud Prevention" defaultOpen={false}>
            <Toggle
              checked={config.requireBillingAddress}
              onChange={() => toggle('requireBillingAddress')}
              label="Require Billing Address"
              description="Enables AVS check — reduces fraud, adds form friction"
            />
          </ConfigSection>

          {/* Impact panel */}
          <div className="card border-blue-600/20 bg-blue-600/5">
            <div className="card-header">
              <div className="text-sm font-semibold text-blue-400">Live Impact vs. Baseline</div>
            </div>
            <div className="card-body space-y-2">
              {IMPACT_ROWS.map(({ key, label }) => {
                const delta = metrics[key] - baseMetrics[key];
                if (Math.abs(delta) < 0.001) return (
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
                <span className={metrics.recoveredRevenue >= baseMetrics.recoveredRevenue ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {metrics.recoveredRevenue >= baseMetrics.recoveredRevenue ? '+' : ''}
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
