import { useState } from 'react';
import { Search, Download, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RECON_RECORDS, RECON_SUMMARY } from '../../data/reconciliation';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import { fmt } from '../../utils/formatters';

const TABS = [
  { key: 'all', label: 'All Records' },
  { key: 'matched', label: 'Matched' },
  { key: 'mismatch', label: 'Mismatches' },
  { key: 'missing', label: 'Missing' },
  { key: 'exception', label: 'Exceptions' },
  { key: 'duplicate', label: 'Duplicates' },
];

const METHOD_LABEL = {
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
};

export default function ReconciliationWorkbench() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const records = RECON_RECORDS.filter((r) => {
    const matchTab = activeTab === 'all' || r.status === activeTab;
    const matchSearch = !search || r.transactionId.toLowerCase().includes(search.toLowerCase()) || r.merchant.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const exceptions = RECON_RECORDS.filter((r) => r.status !== 'matched');

  return (
    <div className="p-6">
      <SectionHeader
        title="Reconciliation Workbench"
        subtitle="Match internal orders against processor settlement and bank deposits"
        actions={
          <button className="btn-secondary flex items-center gap-2">
            <Download size={14} />
            Export
          </button>
        }
      />

      {/* Summary bar */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { key: 'total', label: 'Total', value: RECON_SUMMARY.total, color: 'text-slate-300' },
          { key: 'matched', label: 'Matched', value: RECON_SUMMARY.matched, color: 'text-emerald-400' },
          { key: 'mismatch', label: 'Mismatch', value: RECON_SUMMARY.mismatch, color: 'text-amber-400' },
          { key: 'missing', label: 'Missing', value: RECON_SUMMARY.missing, color: 'text-red-400' },
          { key: 'exception', label: 'Exception', value: RECON_SUMMARY.exception, color: 'text-red-400' },
          { key: 'duplicate', label: 'Duplicate', value: RECON_SUMMARY.duplicate, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.key} className="card p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Match rate */}
      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Reconciliation Match Rate</span>
          <span className="text-sm font-bold text-emerald-400">{fmt.pct(RECON_SUMMARY.matched / RECON_SUMMARY.total)}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            style={{ width: `${(RECON_SUMMARY.matched / RECON_SUMMARY.total) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>{RECON_SUMMARY.matched} matched</span>
          <span>{RECON_SUMMARY.total - RECON_SUMMARY.matched} need attention</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {t.label}
            {t.key !== 'all' && RECON_SUMMARY[t.key] > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400">{RECON_SUMMARY[t.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search transaction ID or merchant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-500">{records.length} records</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Transaction</th>
                <th className="text-left px-4 py-3 font-medium">Method</th>
                <th className="text-right px-4 py-3 font-medium">Internal Amt</th>
                <th className="text-right px-4 py-3 font-medium">Processor Amt</th>
                <th className="text-right px-4 py-3 font-medium">Settlement Amt</th>
                <th className="text-right px-4 py-3 font-medium">Proc. Fee</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Exception</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map((r) => {
                const mismatchAmt = r.processorAmount && Math.abs(r.internalAmount - r.processorAmount) > 0.01;
                return (
                  <tr
                    key={r.id}
                    className={`table-row-hover ${r.status !== 'matched' ? 'bg-amber-500/3' : ''}`}
                    onClick={() => r.status !== 'matched' && navigate(`/exceptions/${r.transactionId}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-300">{r.transactionId}</div>
                      <div className="text-xs text-slate-500">{r.merchant}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{METHOD_LABEL[r.method]}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-200">{fmt.currency(r.internalAmount)}</td>
                    <td className={`px-4 py-3 text-right text-sm ${mismatchAmt ? 'text-amber-400 font-medium' : 'text-slate-200'}`}>
                      {r.processorAmount ? fmt.currency(r.processorAmount) : <span className="text-red-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-300">
                      {r.bankAmount ? fmt.currency(r.bankAmount) : <span className="text-red-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400">{fmt.currency(r.processorFee)}</td>
                    <td className="px-4 py-3"><Badge value={r.status} /></td>
                    <td className="px-4 py-3">
                      {r.exceptionType ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <AlertTriangle size={11} />
                          {r.exceptionType}
                        </div>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmt.datetime(r.ts)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception queue */}
      {activeTab === 'all' && exceptions.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-amber-400">
            <AlertTriangle size={15} />
            Exception Queue ({exceptions.length})
          </div>
          <div className="space-y-2">
            {exceptions.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/exceptions/${r.transactionId}`)}
                className="card p-3.5 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Badge value={r.status} />
                  <div>
                    <div className="font-mono text-xs text-slate-300">{r.transactionId}</div>
                    <div className="text-xs text-slate-500">{r.merchant} · {fmt.currency(r.internalAmount)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {r.exceptionType && <div className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">{r.exceptionType}</div>}
                  {r.assignedTo && <div className="text-xs text-slate-500">Assigned: {r.assignedTo}</div>}
                  <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors">View detail →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
