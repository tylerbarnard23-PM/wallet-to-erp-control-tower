import { statusBadge, decisionBadge } from '../utils/formatters';

const MAP = {
  matched: ['badge-green', 'Matched'],
  mismatch: ['badge-amber', 'Mismatch'],
  missing: ['badge-red', 'Missing'],
  duplicate: ['badge-purple', 'Duplicate'],
  exception: ['badge-red', 'Exception'],
  posted: ['badge-green', 'Posted'],
  ready: ['badge-blue', 'Ready'],
  failed: ['badge-red', 'Failed'],
  review: ['badge-amber', 'Review'],
  approved: ['badge-green', 'Approved'],
  declined: ['badge-red', 'Declined'],
  captured: ['badge-green', 'Captured'],
  authorized: ['badge-blue', 'Authorized'],
  pending_review: ['badge-amber', 'Pending Review'],
  chargeback: ['badge-red', 'Chargeback'],
  refunded: ['badge-blue', 'Refunded'],
  payment: ['badge-blue', 'Payment'],
  refund: ['badge-purple', 'Refund'],
  low: ['badge-green', 'Low'],
  medium: ['badge-amber', 'Medium'],
  high: ['badge-red', 'High'],
};

export default function Badge({ value, label }) {
  const [cls, defaultLabel] = MAP[value] ?? ['badge-slate', value];
  return <span className={cls}>{label ?? defaultLabel}</span>;
}
