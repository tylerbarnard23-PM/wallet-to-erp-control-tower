import { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { ERP_POSTINGS, ERP_SUMMARY } from '../../data/erpPostings';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import { fmt } from '../../utils/formatters';

const ERPS = [
  { key: 'sap', label: 'SAP S/4HANA', color: 'text-blue-400' },
  { key: 'oracle', label: 'Oracle Financials', color: 'text-red-400' },
];

const TYPE_LABEL = { payment: 'Payment', refund: 'Refund', chargeback: 'Chargeback' };

function StatusIcon({ status }) {
  if (status === 'posted') return <CheckCircle2 size={14} className="text-emerald-400" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
  if (status === 'review') return <AlertCircle size={14} className="text-amber-400" />;
  return <Clock size={14} className="text-blue-400" />;
}

function SAPView({ posting }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-950/40 border border-blue-900/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-blue-400 font-mono uppercase tracking-widest">SAP S/4HANA — FI Module</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {posting.sapDocNumber || 'Pending Document Number'}
            </div>
          </div>
          <Badge value={posting.status} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {[
            ['Document Type', 'ZP — Payment'],
            ['Posting Date', posting.postedAt ? fmt.date(posting.postedAt) : '—'],
            ['Company Code', '1000'],
            ['Fiscal Year', '2026'],
            ['Currency', posting.currency],
            ['Cost Center', posting.costCenter],
            ['GL Account', posting.glCode],
            ['Reference', posting.transactionId],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-500 w-28 flex-shrink-0">{k}</span>
              <span className="text-slate-300 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header bg-blue-950/20 flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-widest">Journal Entry Line Items</span>
          <span className="text-xs text-slate-500">{posting.journalEntries.length} lines</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Line</th>
                <th className="text-left px-4 py-2 font-medium">G/L Account</th>
                <th className="text-left px-4 py-2 font-medium">Description</th>
                <th className="text-right px-4 py-2 font-medium">Debit (USD)</th>
                <th className="text-right px-4 py-2 font-medium">Credit (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {posting.journalEntries.map((je, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2 text-slate-500">{String(i + 1).padStart(3, '0')}</td>
                  <td className="px-4 py-2 font-mono text-blue-300">{je.account}</td>
                  <td className="px-4 py-2 text-slate-400">{je.description}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-400">
                    {je.debit > 0 ? fmt.currency(je.debit) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-blue-400">
                    {je.credit > 0 ? fmt.currency(je.credit) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-700 text-slate-300 font-semibold">
                <td colSpan={3} className="px-4 py-2 text-xs text-slate-500">Totals</td>
                <td className="px-4 py-2 text-right font-mono text-xs">
                  {fmt.currency(posting.journalEntries.reduce((s, j) => s + j.debit, 0))}
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs">
                  {fmt.currency(posting.journalEntries.reduce((s, j) => s + j.credit, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {posting.validationError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs text-red-400">
          <strong>Validation Error:</strong> {posting.validationError}
        </div>
      )}
    </div>
  );
}

function OracleView({ posting }) {
  return (
    <div className="space-y-4">
      <div className="bg-red-950/30 border border-red-900/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-red-400 font-mono uppercase tracking-widest">Oracle Fusion Financials — AP/AR</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {posting.oracleDocNumber || 'Pending Journal Entry'}
            </div>
          </div>
          <Badge value={posting.status} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {[
            ['Source', 'PayOps Integration'],
            ['Category', TYPE_LABEL[posting.type] || posting.type],
            ['Accounting Date', posting.postedAt ? fmt.date(posting.postedAt) : '—'],
            ['Ledger', 'Primary USD Ledger'],
            ['Currency', posting.currency],
            ['Status', posting.status.charAt(0).toUpperCase() + posting.status.slice(1)],
            ['Reference', posting.transactionId],
            ['Cost Center', posting.costCenter],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-500 w-28 flex-shrink-0">{k}</span>
              <span className="text-slate-300 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header bg-red-950/15 flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-red-300 uppercase tracking-widest">Subledger Journal Lines</span>
          <span className="text-xs text-slate-500">{posting.journalEntries.length} lines</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Line</th>
                <th className="text-left px-4 py-2 font-medium">Account Combination</th>
                <th className="text-left px-4 py-2 font-medium">Description</th>
                <th className="text-right px-4 py-2 font-medium">Entered DR</th>
                <th className="text-right px-4 py-2 font-medium">Entered CR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {posting.journalEntries.map((je, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-2 font-mono text-red-300">{je.account}</td>
                  <td className="px-4 py-2 text-slate-400">{je.description}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-400">
                    {je.debit > 0 ? fmt.currency(je.debit) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-red-400">
                    {je.credit > 0 ? fmt.currency(je.credit) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {posting.validationError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs text-red-400">
          <strong>Fusion Error:</strong> {posting.validationError}
        </div>
      )}
    </div>
  );
}

export default function ERPSimulator() {
  const [erp, setErp] = useState('sap');
  const [selected, setSelected] = useState(ERP_POSTINGS[0]);
  const [statusFilter, setStatusFilter] = useState('all');

  const visible = ERP_POSTINGS.filter((e) => statusFilter === 'all' || e.status === statusFilter);

  return (
    <div className="p-6">
      <SectionHeader
        title="ERP Posting Simulator"
        subtitle="Preview journal entries and posting status across SAP and Oracle Financials"
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { key: 'posted', label: 'Posted', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { key: 'ready', label: 'Ready to Post', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { key: 'review', label: 'Manual Review', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'failed', label: 'Failed Validation', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(({ key, label, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            className={`card p-4 text-left transition-all ${statusFilter === key ? 'border-blue-600/40 bg-blue-600/10' : 'hover:border-slate-700'}`}
          >
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color} mb-2`}>
              <Icon size={16} />
            </div>
            <div className="text-xl font-bold text-slate-100">{ERP_SUMMARY[key]}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </button>
        ))}
      </div>

      {/* ERP switcher */}
      <div className="flex gap-2 mb-5">
        {ERPS.map((e) => (
          <button
            key={e.key}
            onClick={() => setErp(e.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              erp === e.key
                ? 'border-blue-600/40 bg-blue-600/10 text-blue-300'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet size={14} />
            {e.label}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Posting list */}
        <div className="w-80 flex-shrink-0 card overflow-hidden h-fit">
          <div className="card-header text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Posting Queue
          </div>
          <div className="divide-y divide-slate-800/60">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-slate-800/50 ${
                  selected?.id === p.id ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''
                }`}
              >
                <StatusIcon status={p.status} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-slate-300 truncate">{p.transactionId}</div>
                  <div className="text-xs text-slate-500 truncate">{p.merchant}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-medium text-slate-300">{fmt.currency(p.amount)}</div>
                  <div className="text-xs text-slate-500 capitalize">{TYPE_LABEL[p.type]}</div>
                </div>
                <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Detail view */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{selected.merchant}</div>
                  <div className="text-xs text-slate-400">{fmt.currency(selected.amount)} · {TYPE_LABEL[selected.type]} · {fmt.datetime(selected.ts)}</div>
                </div>
                <div className="flex gap-2">
                  {selected.status === 'ready' && <button className="btn-primary text-xs">Post to {erp.toUpperCase()}</button>}
                  {selected.status === 'failed' && <button className="bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 text-xs font-medium py-2 px-3 rounded-lg transition-colors">Retry Posting</button>}
                  {selected.status === 'review' && <button className="btn-primary text-xs">Approve & Post</button>}
                  <button className="btn-secondary text-xs">View Transaction</button>
                </div>
              </div>
              {erp === 'sap' ? <SAPView posting={selected} /> : <OracleView posting={selected} />}
            </>
          ) : (
            <div className="card p-8 text-center text-slate-400">Select a posting to preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
