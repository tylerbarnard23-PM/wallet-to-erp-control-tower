import { TRANSACTIONS } from './transactions.js';

function processorAmt(txn) {
  if (txn.reconStatus === 'mismatch') return txn.amount * (0.997 + Math.random() * 0.006);
  return txn.amount;
}

function bankAmt(txn, procAmt) {
  const feeRate = txn.method === 'apple_pay' || txn.method === 'google_pay' ? 0.0175 : 0.0225;
  return procAmt - procAmt * feeRate;
}

export const RECON_RECORDS = TRANSACTIONS.map((txn) => {
  const proc = processorAmt(txn);
  const bank = bankAmt(txn, proc);
  const feeRate = txn.method === 'apple_pay' || txn.method === 'google_pay' ? 0.0175 : 0.0225;
  return {
    id: `REC-${txn.id.replace('TXN-', '')}`,
    transactionId: txn.id,
    merchant: txn.merchant,
    method: txn.method,
    ts: txn.ts,
    internalAmount: txn.amount,
    processorAmount: txn.reconStatus === 'missing' ? null : parseFloat(proc.toFixed(2)),
    bankAmount: ['missing', 'exception'].includes(txn.reconStatus) ? null : parseFloat(bank.toFixed(2)),
    processorFee: parseFloat((txn.amount * feeRate).toFixed(2)),
    status: txn.reconStatus,
    exceptionType: {
      mismatch: 'Amount Mismatch',
      missing: 'Missing Processor Record',
      duplicate: 'Duplicate Capture',
      exception: txn.status === 'chargeback' ? 'Chargeback' : 'Review Required',
    }[txn.reconStatus] || null,
    customerId: txn.customerId,
    processorRef: txn.processorRef,
    assignedTo: ['missing', 'mismatch', 'exception', 'duplicate'].includes(txn.reconStatus)
      ? ['A. Chen', 'B. Patel', 'C. Williams', 'D. Kim'][Math.floor(Math.random() * 4)]
      : null,
    resolvedAt: null,
    notes: '',
  };
});

export const RECON_SUMMARY = {
  total: RECON_RECORDS.length,
  matched: RECON_RECORDS.filter((r) => r.status === 'matched').length,
  mismatch: RECON_RECORDS.filter((r) => r.status === 'mismatch').length,
  missing: RECON_RECORDS.filter((r) => r.status === 'missing').length,
  duplicate: RECON_RECORDS.filter((r) => r.status === 'duplicate').length,
  exception: RECON_RECORDS.filter((r) => r.status === 'exception').length,
};
