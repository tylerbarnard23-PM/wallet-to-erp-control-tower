import { X, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import { fmt, riskColor, riskLabel } from '../../utils/formatters';

const METHOD_LABEL = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
};

const SIGNAL_ROWS = [
  { key: 'walletToken', label: 'Wallet Token', good: true, impact: -18, desc: 'Tokenized payment — reduced risk' },
  { key: 'deviceMatch', label: 'Device Fingerprint', good: true, impact: -8, desc: 'Device matches customer profile' },
  { key: 'billingMatch', label: 'AVS / Billing Match', good: true, impact: -12, desc: 'Address verification passed' },
  { key: 'countryMatch', label: 'Issuer Country Match', good: true, impact: -6, desc: 'Card country matches shipping' },
  { key: 'velocity', label: 'Transaction Velocity', good: false, impact: 0, desc: 'Recent transaction frequency' },
  { key: 'amountRisk', label: 'Amount Risk Tier', good: false, impact: 0, desc: 'Amount vs. customer baseline' },
  { key: 'chargebackHistory', label: 'Chargeback History', good: false, impact: 22, desc: 'Prior dispute on this card/customer' },
];

function SignalRow({ sig, value }) {
  let status, statusText, impact;
  if (sig.key === 'walletToken') {
    status = value ? 'good' : 'neutral';
    statusText = value ? 'Present' : 'Absent';
    impact = value ? -18 : 0;
  } else if (sig.key === 'velocity') {
    status = value === 'normal' ? 'good' : value === 'elevated' ? 'warn' : 'bad';
    statusText = value.charAt(0).toUpperCase() + value.slice(1);
    impact = value === 'normal' ? -4 : value === 'elevated' ? 12 : 24;
  } else if (sig.key === 'amountRisk') {
    status = value === 'low' ? 'good' : value === 'medium' ? 'warn' : 'bad';
    statusText = value.charAt(0).toUpperCase() + value.slice(1);
    impact = value === 'low' ? -2 : value === 'medium' ? 8 : 18;
  } else if (sig.key === 'chargebackHistory') {
    status = value ? 'bad' : 'good';
    statusText = value ? 'Yes' : 'No';
    impact = value ? 22 : -6;
  } else {
    status = value ? 'good' : 'bad';
    statusText = value ? 'Pass' : 'Fail';
    impact = value ? sig.impact : -sig.impact;
  }

  const colors = {
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    bad: 'text-red-400',
    neutral: 'text-slate-400',
  };
  const icons = {
    good: <CheckCircle2 size={13} className="text-emerald-400" />,
    warn: <AlertCircle size={13} className="text-amber-400" />,
    bad: <XCircle size={13} className="text-red-400" />,
    neutral: <AlertCircle size={13} className="text-slate-500" />,
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <div className="flex items-center gap-2.5">
        {icons[status]}
        <div>
          <div className="text-xs font-medium text-slate-300">{sig.label}</div>
          <div className="text-xs text-slate-500">{sig.desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${colors[status]}`}>{statusText}</span>
        {impact !== 0 && (
          <span className={`text-xs font-mono ${impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {impact > 0 ? '+' : ''}{impact}
          </span>
        )}
      </div>
    </div>
  );
}

const DECISION_CONFIG = {
  approved: { icon: CheckCircle2, textColor: 'text-emerald-400', label: 'Approved', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  review: { icon: AlertCircle, textColor: 'text-amber-400', label: 'Flagged for Review', bg: 'bg-amber-500/10 border-amber-500/25' },
  declined: { icon: XCircle, textColor: 'text-red-400', label: 'Declined', bg: 'bg-red-500/10 border-red-500/25' },
};

export default function FraudDetail({ transaction: t, onClose }) {
  const dc = DECISION_CONFIG[t.fraudDecision];
  const Icon = dc.icon;

  return (
    <div className="card h-full overflow-auto">
      <div className="card-header flex items-center justify-between sticky top-0 bg-slate-900 z-10">
        <div className="text-sm font-semibold text-slate-200">Risk Detail</div>
        <button onClick={onClose} className="btn-ghost p-1.5">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Transaction header */}
        <div className="bg-slate-800 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">{t.id}</span>
            <Badge value={t.status} />
          </div>
          <div className="text-lg font-bold text-slate-100">{fmt.currency(t.amount)}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{t.merchant}</span>
            <span>·</span>
            <span>{METHOD_LABEL[t.method]}</span>
            <span>·</span>
            <span>{fmt.datetime(t.ts)}</span>
          </div>
        </div>

        {/* Risk score gauge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Composite Risk Score</span>
            <span className={`text-2xl font-bold ${
              t.fraudScore < 30 ? 'text-emerald-400' : t.fraudScore < 60 ? 'text-amber-400' : 'text-red-400'
            }`}>{t.fraudScore}</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{
            background: 'linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)'
          }}>
            <div className="absolute inset-0 bg-slate-900/40" />
            <div
              className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg transform -translate-x-1"
              style={{ left: `${t.fraudScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>0 — Low</span>
            <span>50 — Medium</span>
            <span>High — 100</span>
          </div>
        </div>

        {/* Decision */}
        <div className={`rounded-xl border p-3 ${dc.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <Icon size={15} className={dc.textColor} />
            <span className={`text-sm font-semibold ${dc.textColor}`}>{dc.label}</span>
          </div>
          <div className="text-xs text-slate-400">
            {t.fraudDecision === 'approved' && 'All signals within acceptable thresholds. Transaction processed automatically.'}
            {t.fraudDecision === 'review' && 'Multiple elevated signals detected. Transaction held for manual review before processing.'}
            {t.fraudDecision === 'declined' && 'Critical risk signals exceeded policy thresholds. Transaction blocked immediately.'}
          </div>
        </div>

        {/* Signal breakdown */}
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Signal Breakdown</div>
          <div>
            {SIGNAL_ROWS.map((sig) => (
              <SignalRow key={sig.key} sig={sig} value={t.signals[sig.key]} />
            ))}
          </div>
        </div>

        {/* Reason codes */}
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Reason Codes</div>
          <div className="space-y-1">
            {t.signals.walletToken && <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">RC-001 — Wallet tokenization detected (positive signal)</div>}
            {!t.signals.deviceMatch && <div className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg">RC-104 — Device fingerprint mismatch</div>}
            {!t.signals.billingMatch && <div className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">RC-201 — AVS billing address mismatch</div>}
            {t.signals.velocity === 'elevated' && <div className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg">RC-302 — Transaction velocity elevated vs. 30-day baseline</div>}
            {t.signals.velocity === 'high' && <div className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">RC-303 — Transaction velocity critically high</div>}
            {t.signals.chargebackHistory && <div className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">RC-401 — Prior chargeback history on account</div>}
            {!t.signals.countryMatch && <div className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">RC-501 — Issuing country / shipping country mismatch</div>}
            {t.signals.amountRisk === 'high' && <div className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">RC-601 — Amount significantly exceeds 90-day average</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 btn-secondary text-xs py-2">Override Decision</button>
          <button className="flex-1 bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 text-xs font-medium py-2 px-3 rounded-lg transition-colors">Flag for Ops</button>
        </div>
      </div>
    </div>
  );
}
