import { TRANSACTIONS } from './transactions.js';

function sapDocNum(i) {
  return `FI-2026-${String(1800 + i).padStart(6, '0')}`;
}
function oracleDocNum(i) {
  return `AP-JE-2026-${String(40210 + i).padStart(5, '0')}`;
}

function buildJournalEntries(txn) {
  const feeRate = txn.method === 'apple_pay' || txn.method === 'google_pay' ? 0.0175 : 0.0225;
  const fee = parseFloat((txn.amount * feeRate).toFixed(2));
  const net = parseFloat((txn.amount - fee).toFixed(2));

  if (txn.status === 'chargeback') {
    return [
      { account: '1200 — AR', debit: 0, credit: txn.amount, description: 'Chargeback reversal — AR' },
      { account: '1000 — Cash', debit: txn.amount, credit: 0, description: 'Chargeback debit — cash reversed' },
      { account: '6310 — Chargeback Losses', debit: fee, credit: 0, description: 'Chargeback fee' },
    ];
  }
  if (txn.status === 'refunded') {
    return [
      { account: '2100 — Refunds Payable', debit: txn.amount, credit: 0, description: 'Refund issued to customer' },
      { account: '1000 — Cash', debit: 0, credit: txn.amount, description: 'Refund cash disbursed' },
      { account: '6300 — Processor Fees', debit: fee, credit: 0, description: 'Processor fee — non-refundable' },
    ];
  }
  return [
    { account: '1200 — AR', debit: txn.amount, credit: 0, description: 'Customer payment captured' },
    { account: '1000 — Cash', debit: 0, credit: net, description: 'Net settlement received' },
    { account: '6300 — Processor Fees', debit: fee, credit: 0, description: 'Processor interchange & assessment fees' },
  ];
}

export const ERP_POSTINGS = TRANSACTIONS.map((txn, i) => {
  const type = txn.status === 'chargeback' ? 'chargeback'
    : txn.status === 'refunded' ? 'refund'
    : 'payment';

  return {
    id: `ERP-${txn.id.replace('TXN-', '')}`,
    transactionId: txn.id,
    merchant: txn.merchant,
    ts: txn.ts,
    amount: txn.amount,
    method: txn.method,
    type,
    status: txn.erpStatus,
    validationError: txn.erpStatus === 'failed'
      ? ['GL account not found', 'Cost center mismatch', 'Posting period closed', 'Currency conversion error'][i % 4]
      : null,
    journalEntries: buildJournalEntries(txn),
    sapDocNumber: txn.erpStatus === 'posted' ? sapDocNum(i) : null,
    oracleDocNumber: txn.erpStatus === 'posted' ? oracleDocNum(i) : null,
    postedAt: txn.erpStatus === 'posted' ? new Date(new Date(txn.ts).getTime() + 3600000).toISOString() : null,
    postedBy: txn.erpStatus === 'posted' ? 'auto-posting-svc' : null,
    currency: 'USD',
    costCenter: `CC-${1000 + (i % 8) * 100}`,
    glCode: type === 'payment' ? '4000' : type === 'refund' ? '4010' : '6310',
  };
});

export const ERP_SUMMARY = {
  posted: ERP_POSTINGS.filter((e) => e.status === 'posted').length,
  ready: ERP_POSTINGS.filter((e) => e.status === 'ready').length,
  failed: ERP_POSTINGS.filter((e) => e.status === 'failed').length,
  review: ERP_POSTINGS.filter((e) => e.status === 'review').length,
};
