import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertOctagon, Clock, ChevronRight } from 'lucide-react';
import { RECON_RECORDS } from '../../data/reconciliation';
import { TRANSACTIONS } from '../../data/transactions';
import Badge from '../../components/Badge';
import SectionHeader from '../../components/SectionHeader';
import { fmt } from '../../utils/formatters';

const PRIORITY = { exception: 1, missing: 2, mismatch: 3, duplicate: 4 };

const exceptions = RECON_RECORDS
  .filter((r) => r.status !== 'matched')
  .sort((a, b) => (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9));

const COUNTS = {
  exception: exceptions.filter((r) => r.status === 'exception').length,
  missing:   exceptions.filter((r) => r.status === 'missing').length,
  mismatch:  exceptions.filter((r) => r.status === 'mismatch').length,
  duplicate: exceptions.filter((r) => r.status === 'duplicate').length,
};

const STATUS_META = {
  exception: { label: 'Chargeback / Exception', icon: AlertOctagon, urgency: 'Urgent', urgencyClass: 'text-red-400 bg-red-500/10 border-red-500/20' },
  missing:   { label: 'Missing Processor Record', icon: AlertTriangle, urgency: 'High', urgencyClass: 'text-red-400 bg-red-500/10 border-red-500/20' },
  mismatch:  { label: 'Amount Mismatch', icon: AlertTriangle, urgency: 'Medium', urgencyClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  duplicate: { label: 'Duplicate Capture', icon: AlertTriangle, urgency: 'Medium', urgencyClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

export default function ExceptionsList() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <SectionHeader
        title="Exception Queue"
        subtitle="All reconciliation exceptions requiring investigation or resolution"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'exception', label: 'Chargeback / Exception', color: 'text-red-400', bg: 'bg-red-500/10' },
          { key: 'missing',   label: 'Missing Record',         color: 'text-red-400',   bg: 'bg-red-500/10' },
          { key: 'mismatch',  label: 'Amount Mismatch',        color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'duplicate', label: 'Duplicate Capture',      color: 'text-purple-400',bg: 'bg-purple-500/10' },
        ].map(({ key, label, color, bg }) => (
          <div key={key} className="card p-4">
            <div className={`text-2xl font-bold ${color}`}>{COUNTS[key]}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Exception list */}
      <div className="space-y-2">
        {exceptions.map((r) => {
          const txn = TRANSACTIONS.find((t) => t.id === r.transactionId);
          const meta = STATUS_META[r.status] ?? STATUS_META.mismatch;
          const Icon = meta.icon;

          return (
            <div
              key={r.id}
              onClick={() => navigate(`/exceptions/${r.transactionId}`)}
              className="card p-4 flex items-center gap-4 cursor-pointer hover:border-slate-700 transition-all group"
            >
              {/* Status icon */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-800">
                <Icon size={16} className={r.status === 'exception' || r.status === 'missing' ? 'text-red-400' : 'text-amber-400'} />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm text-slate-200">{r.transactionId}</span>
                  <Badge value={r.status} />
                  {r.exceptionType && (
                    <span className="text-xs text-slate-400">{r.exceptionType}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {r.merchant} · {fmt.currency(r.internalAmount)} · {fmt.datetime(r.ts)}
                </div>
              </div>

              {/* Urgency + assignee */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${meta.urgencyClass}`}>
                  {meta.urgency}
                </span>
                {r.assignedTo ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                      {r.assignedTo.charAt(0)}
                    </div>
                    {r.assignedTo}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={11} />
                    Unassigned
                  </div>
                )}
                <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {exceptions.length === 0 && (
        <div className="card p-12 text-center">
          <AlertOctagon size={32} className="text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400">No exceptions — all records reconciled</div>
        </div>
      )}
    </div>
  );
}
