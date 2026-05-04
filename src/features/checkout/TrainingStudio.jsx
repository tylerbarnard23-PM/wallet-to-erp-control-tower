import { useState } from 'react';
import {
  RotateCcw, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Sparkles, BookOpen, Target, AlertTriangle, CheckCircle, Zap,
} from 'lucide-react';
import { useAppContext, defaultConfig } from '../../context/AppContext';
import { calculateMetrics, getMetricsExplanation } from '../../services/metricsService';
import { PRODUCT_CATALOG, CATEGORIES } from '../../data/productCatalog';
import { TRAINING_SCENARIOS } from '../../data/trainingScenarios';
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

function ScenarioCard({ scenario, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl border text-left transition-all ${
        isActive
          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300 hover:bg-slate-700/50'
      }`}
    >
      <div className="text-base leading-none">{scenario.icon}</div>
      <div className="text-xs font-medium leading-tight">{scenario.label}</div>
    </button>
  );
}

function TrainingPanel({ selectedProduct, config, metrics, baseMetrics }) {
  const explanation = getMetricsExplanation(config, selectedProduct);

  if (!selectedProduct) {
    return (
      <div className="card border-slate-700">
        <div className="card-body text-center text-slate-500 text-sm py-6">
          Select a scenario or category to see training insights
        </div>
      </div>
    );
  }

  const captureDelta = metrics.captureRate - baseMetrics.captureRate;

  return (
    <div className="card border-blue-600/20 bg-gradient-to-b from-blue-600/5 to-transparent">
      <div className="card-header flex items-center gap-2">
        <BookOpen size={14} className="text-blue-400" />
        <div className="text-sm font-semibold text-blue-400">Training Insights</div>
      </div>
      <div className="card-body space-y-4">
        {/* Product context */}
        <div className="flex items-start gap-3">
          <span className="text-2xl">{selectedProduct.icon}</span>
          <div>
            <div className="text-xs font-semibold text-slate-200">{selectedProduct.productName}</div>
            <div className="text-xs text-slate-500">{selectedProduct.categoryLabel} · {selectedProduct.merchantName}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                selectedProduct.buyerAnxietyLevel === 'high' ? 'bg-red-500/15 text-red-400' :
                selectedProduct.buyerAnxietyLevel === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                'bg-emerald-500/15 text-emerald-400'
              }`}>
                {selectedProduct.buyerAnxietyLevel} anxiety
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                selectedProduct.fraudRiskProfile === 'high' ? 'bg-red-500/15 text-red-400' :
                selectedProduct.fraudRiskProfile === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                'bg-emerald-500/15 text-emerald-400'
              }`}>
                {selectedProduct.fraudRiskProfile} fraud risk
              </span>
            </div>
          </div>
        </div>

        {/* Lesson */}
        <div className="text-xs text-slate-400 leading-relaxed bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          {selectedProduct.trainingLesson}
        </div>

        {/* Top drivers */}
        {explanation.topDrivers.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
              <TrendingUp size={12} />
              Top conversion drivers for this category
            </div>
            <div className="space-y-1.5">
              {explanation.topDrivers.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tradeoffs */}
        {explanation.topTradeoffs.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
              <AlertTriangle size={12} />
              Risks & tradeoffs to watch
            </div>
            <div className="space-y-1.5">
              {explanation.topTradeoffs.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <AlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capture impact */}
        <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border ${
          captureDelta > 0.001 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          captureDelta < -0.001 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-slate-800 border-slate-700 text-slate-500'
        }`}>
          <span>Current config vs. baseline</span>
          <span className="font-bold">
            {captureDelta > 0.001 ? '+' : ''}{(captureDelta * 100).toFixed(1)}pp capture rate
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TrainingStudio() {
  const { config, toggle, set, reset, selectedProduct, selectedCategory, selectProduct, selectCategory, cartItems, setTrainingScenario, applyRecommendedConfig, activeTrainingScenario } = useAppContext();
  const [lastPaid, setLastPaid] = useState(null);

  const metrics = calculateMetrics(config, selectedCategory);
  const baseMetrics = calculateMetrics(defaultConfig, selectedCategory);

  const IMPACT_ROWS = [
    { key: 'captureRate',       label: 'Capture Rate' },
    { key: 'walletAdoption',    label: 'Wallet Adoption' },
    { key: 'fraudApprovalRate', label: 'Fraud Approval' },
    { key: 'reconMatchRate',    label: 'Recon Match' },
    { key: 'erpPostingSuccess', label: 'ERP Posting' },
  ];

  const categoryProducts = PRODUCT_CATALOG.filter(p => p.category === selectedCategory);

  return (
    <div className="p-4 md:p-6">
      <SectionHeader
        title="Conversion Training Studio"
        subtitle="Select a scenario, modify checkout settings, and observe how decisions cascade from capture rate through ERP posting"
        actions={
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </button>
        }
      />

      {/* ── Scenario selector ─── */}
      <div className="card mb-4 overflow-hidden">
        <div className="card-header flex items-center gap-2">
          <Target size={14} className="text-blue-400" />
          <div className="text-sm font-semibold text-slate-200">Training Scenarios</div>
          {activeTrainingScenario && (
            <span className="ml-auto text-xs text-blue-400 bg-blue-600/15 border border-blue-600/20 px-2 py-0.5 rounded-full">
              {activeTrainingScenario.label}
            </span>
          )}
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TRAINING_SCENARIOS.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                isActive={activeTrainingScenario?.id === s.id}
                onClick={() => setTrainingScenario(s)}
              />
            ))}
          </div>
          {activeTrainingScenario && (
            <div className="mt-3 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{activeTrainingScenario.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 mb-0.5">{activeTrainingScenario.label}</div>
                  <div className="text-xs text-slate-400 mb-1">{activeTrainingScenario.problem}</div>
                  <div className="text-xs text-blue-400">
                    <span className="font-medium">Objective:</span> {activeTrainingScenario.objective}
                  </div>
                  {activeTrainingScenario.expectedKPIMovement && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(activeTrainingScenario.expectedKPIMovement).map(([k, v]) => (
                        <span key={k} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                          {k.replace(/([A-Z])/g, ' $1').toLowerCase()}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category / product selector ─── */}
      <div className="card mb-4">
        <div className="card-header text-sm font-semibold text-slate-200">Category & Product</div>
        <div className="px-4 pb-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  selectCategory(cat.id);
                  const first = PRODUCT_CATALOG.find(p => p.category === cat.id);
                  if (first) selectProduct(first);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
          {categoryProducts.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categoryProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedProduct?.id === p.id
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {p.icon} {p.productName}
                </button>
              ))}
            </div>
          )}
          {selectedProduct && (
            <button
              onClick={applyRecommendedConfig}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-colors"
            >
              <Sparkles size={12} />
              Apply recommended config for {selectedProduct.categoryLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Main split layout ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Left: controls */}
        <div className="xl:col-span-2 space-y-3">

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

          <ConfigSection title="Fraud Prevention" defaultOpen={false}>
            <Toggle
              checked={config.requireBillingAddress}
              onChange={() => toggle('requireBillingAddress')}
              label="Require Billing Address"
              description="Enables AVS check — reduces fraud, adds form friction"
            />
          </ConfigSection>

          {/* Training insights panel */}
          <TrainingPanel
            selectedProduct={selectedProduct}
            config={config}
            metrics={metrics}
            baseMetrics={baseMetrics}
          />

          {/* Live impact panel */}
          <div className="card border-blue-600/20 bg-blue-600/5">
            <div className="card-header">
              <div className="text-sm font-semibold text-blue-400">Live KPI Impact vs. Baseline</div>
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

          {/* Scenario teaching notes */}
          {activeTrainingScenario?.teachingNotes && (
            <div className="card border-amber-500/20 bg-amber-500/5">
              <div className="card-header flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <div className="text-sm font-semibold text-amber-400">What to Notice</div>
              </div>
              <div className="card-body space-y-2">
                {activeTrainingScenario.teachingNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: checkout preview */}
        <div className="xl:col-span-3 space-y-3">
          <CheckoutPreview
            config={config}
            cartItems={cartItems.length > 0 ? cartItems : (selectedProduct ? [{ ...selectedProduct, qty: 1 }] : undefined)}
            selectedProduct={selectedProduct}
            onPay={(method) => setLastPaid(method)}
          />
          {lastPaid && (
            <div className="card border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Demo payment initiated via {lastPaid} — no real transaction processed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
