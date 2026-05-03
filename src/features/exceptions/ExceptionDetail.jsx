import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, User, FileText, Zap } from 'lucide-react';
import { RECON_RECORDS } from '../../data/reconciliation';
import { ERP_POSTINGS } from '../../data/erpPostings';
import { TRANSACTIONS } from '../../data/transactions';
import Badge from '../../components/Badge';
import { fmt } from '../../utils/formatters';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Escalated'];

function buildAuditTrail(record, txn) {
  const base = new Date(txn.ts);
  return [
    { ts: new Date(base.getTime() - 2000).toISOString(), actor: 'Payment Gateway', action: 'Transaction authorized', type: 'system' },
    { ts: new Date(base.getTime() + 900000).toISOString(), actor: 'Processor', action: 'Settlement file received', type: 'system' },
    { ts: new Date(base.getTime() + 1800000).toISOString(), actor: 'Recon Engine', action: `Exception raised — ${record.exceptionType}`, type: 'exception' },
    { ts: new Date(base.getTime() + 3600000).toISOString(), actor: 'Auto-Assign', action: `Assigned to ${record.assignedTo || 'Unassigned'}`, type: 'system' },
    { ts: new Date(base.getTime() + 7200000).toISOString(), actor: record.assignedTo || 'System', action: 'Exception under investigation', type: 'user' },
  ];
}

const ROOT_CAUSE = {
  mismatch: {
    title: 'Amount Mismatch Detected',
    desc: 'The amount recorded in the internal order management system does not match the amount settled by the payment processor. This is typically caused by a late partial capture, a timing difference, or a processor-side adjustment.',
    action: 'Compare the capture request timestamp against the processor settlement file. Check if a partial capture or post-authorization adjustment was applied. Contact processor reconciliation team if unresolved within 48 hours.',
  },
  missing: {
    title: 'Processor Record Not Found',
    desc: 'The transaction exists in the internal order system but has no corresponding record in the processor settlement file for the expected settlement date. This may indicate a failed capture, a processing timeout, or a settlement batch discrepancy.',
    action: 'Verify the capture status via processor API. If capture was successful, request manual settlement confirmation. If capture failed, trigger a retry or mark the order for manual payment collection.',
  },
  duplicate: {
    title: 'Duplicate Capture Detected',
    desc: 'Two processor settlement records were matched to a single internal order. This may indicate a network retry that resulted in a double-charge, or a batch duplication error on the processor side.',
    action: 'Cross-reference processor logs for duplicate authorization codes. Issue a refund for the duplicate amount immediately. File a dispute with the processor if the duplicate originated from their system.',
  },
  exception: {
    title: 'Chargeback or Dispute Filed',
    desc: 'A chargeback or dispute has been received for this transaction. Funds have been reversed and a processing fee has been debited. Immediate action is required to respond to the dispute within the issuer\'s response window.',
    action: 'Gather evidence: order confirmation, delivery proof, customer communication, IP/device logs. Submit rebuttal to processor within 7 business days. Engage fraud team if velocity rules were not triggered at authorization.',
  },
};

export default function ExceptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const record = RECON_RECORDS.find((r) => r.transactionId === id);
  const txn = TRANSACTIONS.find((t) => t.id === id);
  const erpPosting = ERP_POSTINGS.find((e) => e.transactionId === id);

  if (!record || !txn) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/reconciliation')} className="btn-ghost flex items-center gap-2 mb-4">
          <ArrowLeft size={14} />Back to Reconciliation
        </button>
        <div className="card p-8 text-center text-slate-400">Transaction not found or has no exception.</div>
      </div>
    );
  }

  const rc = ROOT_CAUSE[record.status] || ROOT_CAUSE.exception;
  const trail = buildAuditTrail(record, txn);

  return (
    <div className="p-6">
      <button onClick={() => navigate('/reconciliation')} className="btn-ghost flex items-center gap-2 mb-5 text-sm">
        <ArrowLeft size={14} />Back to Reconciliation Workbench
      </button>

      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle size={18} className="text-amber-400" />
            <h1 className="text-xl font-semibold text-slate-100">{rc.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="font-mono">{txn.id}</span>
            <span>·</span>
            <span>{txn.merchant}</span>
            <span>·</span>
            <Badge value={record.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn-primary">Save</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Root cause */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <span className="text-sm font-semibold text-slate-200">Root Cause Analysis</span>
            </div>
            <div className="card-body">
              <p className="text-sm text-slate-300 leading-relaxed">{rc.desc}</p>
            </div>
          </div>

          {/* Suggested action */}
          <div className="card border-blue-600/20">
            <div className="card-header flex items-center gap-2">
              <Zap size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-200">Suggested Action</span>
            </div>
            <div className="card-body">
              <p className="text-sm text-slate-300 leading-relaxed">{rc.action}</p>
              <div className="flex gap-2 mt-4">
                <button className="btn-primary text-xs">Initiate Action</button>
                <button className="btn-secondary text-xs">Escalate to Manager</button>
                <button className="btn-secondary text-xs">Add Note</button>
              </div>
            </div>
          </div>

          {/* Audit trail */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Clock size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">Audit Trail</span>
            </div>
            <div className="card-body">
              <div className="relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-700" />
                <div className="space-y-4">
                  {trail.map((e, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        e.type === 'exception' ? 'bg-amber-500/20 text-amber-400' :
                        e.type === 'user' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {e.type === 'exception' ? <AlertTriangle size={12} /> :
                         e.type === 'user' ? <User size={12} /> :
                         <Zap size={12} />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-slate-300">{e.action}</div>
                          <div className="text-xs text-slate-500">{fmt.datetime(e.ts)}</div>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{e.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Transaction details */}
          <div className="card">
            <div className="card-header text-sm font-semibold text-slate-200">Transaction Details</div>
            <div className="card-body space-y-2.5 text-sm">
              {[
                ['Amount', fmt.currency(txn.amount)],
                ['Status', <Badge key="s" value={txn.status} />],
                ['Method', txn.walletType || txn.method.replace('_', ' ')],
                ['Processor Ref', txn.processorRef || '—'],
                ['Customer', txn.customerId],
                ['Date', fmt.datetime(txn.ts)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reconciliation */}
          <div className="card">
            <div className="card-header text-sm font-semibold text-slate-200">Reconciliation Amounts</div>
            <div className="card-body space-y-2.5 text-sm">
              {[
                ['Internal', fmt.currency(record.internalAmount), 'text-slate-200'],
                ['Processor', record.processorAmount ? fmt.currency(record.processorAmount) : '—', record.processorAmount && Math.abs(record.internalAmount - record.processorAmount) > 0.01 ? 'text-amber-400' : 'text-slate-200'],
                ['Bank Settlement', record.bankAmount ? fmt.currency(record.bankAmount) : '—', 'text-slate-200'],
                ['Processor Fee', fmt.currency(record.processorFee), 'text-slate-400'],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-medium font-mono text-xs ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ERP Impact */}
          {erpPosting && (
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">ERP Impact</span>
              </div>
              <div className="card-body space-y-2.5 text-sm">
                {[
                  ['ERP Status', <Badge key="e" value={erpPosting.status} />],
                  ['GL Code', erpPosting.glCode],
                  ['Cost Center', erpPosting.costCenter],
                  erpPosting.sapDocNumber ? ['SAP Doc', erpPosting.sapDocNumber] : null,
                  erpPosting.validationError ? ['Validation Error', <span key="v" className="text-red-400 text-xs">{erpPosting.validationError}</span>] : null,
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-medium text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">Ownership</span>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {record.assignedTo?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">{record.assignedTo || 'Unassigned'}</div>
                  <div className="text-xs text-slate-500">Reconciliation Analyst</div>
                </div>
              </div>
              <button className="btn-secondary w-full mt-3 text-xs">Reassign</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
