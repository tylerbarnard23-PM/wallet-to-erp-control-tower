import { useState } from 'react';
import { Search, Filter, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { TRANSACTIONS } from '../../data/transactions';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import { fmt, riskColor, riskLabel } from '../../utils/formatters';
import FraudDetail from './FraudDetail';

const METHOD_LABEL = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
};

function ScoreBar({ score }) {
  const color = riskColor(score);
  const colors = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' };
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${colors[color]}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-mono font-medium ${
        color === 'emerald' ? 'text-emerald-400' : color === 'amber' ? 'text-amber-400' : 'text-red-400'
      }`}>{score}</span>
    </div>
  );
}

const SUMMARY = {
  total: TRANSACTIONS.length,
  approved: TRANSACTIONS.filter((t) => t.fraudDecision === 'approved').length,
  review: TRANSACTIONS.filter((t) => t.fraudDecision === 'review').length,
  declined: TRANSACTIONS.filter((t) => t.fraudDecision === 'declined').length,
};

export default function FraudLayer() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) || t.merchant.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.fraudDecision === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6">
      <SectionHeader
        title="Fraud Decision Layer"
        subtitle="Real-time risk scoring, signal analysis, and approve/review/decline decisions"
      />

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { key: 'total', label: 'Total', icon: Filter, color: 'text-slate-400', bg: 'bg-slate-800' },
          { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { key: 'review', label: 'Under Review', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'declined', label: 'Declined', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(({ key, label, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilter(key === 'total' ? 'all' : key)}
            className={`card p-4 text-left transition-all ${(filter === key || (key === 'total' && filter === 'all')) ? 'border-blue-600/40 bg-blue-600/10' : 'hover:border-slate-700'}`}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color} mb-2`}>
              <Icon size={16} />
            </div>
            <div className="text-xl font-bold text-slate-100">{SUMMARY[key]}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`flex-1 card overflow-hidden ${selected ? 'hidden xl:block' : ''}`}>
          <div className="card-header flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search transaction or merchant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500">
                  <th className="text-left px-4 py-3 font-medium">Transaction</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Method</th>
                  <th className="text-left px-4 py-3 font-medium">Risk Score</th>
                  <th className="text-left px-4 py-3 font-medium">Signals</th>
                  <th className="text-left px-4 py-3 font-medium">Decision</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={`table-row-hover text-sm ${selected?.id === t.id ? 'bg-blue-600/10' : ''}`}
                    onClick={() => setSelected(t)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-300">{t.id}</div>
                      <div className="text-xs text-slate-500">{t.merchant}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">{fmt.currency(t.amount)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{METHOD_LABEL[t.method]}</td>
                    <td className="px-4 py-3"><ScoreBar score={t.fraudScore} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.signals.walletToken && <span className="badge-green text-xs">Token</span>}
                        {t.signals.velocity === 'elevated' && <span className="badge-amber text-xs">Velocity↑</span>}
                        {t.signals.velocity === 'high' && <span className="badge-red text-xs">Velocity↑↑</span>}
                        {!t.signals.deviceMatch && <span className="badge-amber text-xs">Dev⚠</span>}
                        {!t.signals.billingMatch && <span className="badge-red text-xs">AVS Fail</span>}
                        {t.signals.chargebackHistory && <span className="badge-red text-xs">CB Hist</span>}
                        {!t.signals.countryMatch && <span className="badge-red text-xs">Country⚠</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge value={t.fraudDecision} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmt.datetime(t.ts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full xl:w-96 flex-shrink-0">
            <FraudDetail transaction={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
