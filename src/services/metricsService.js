const BASE = {
  captureRate: 0.798,
  walletAdoption: 0.512,
  fraudApprovalRate: 0.921,
  reconMatchRate: 0.889,
  erpPostingSuccess: 0.954,
  manualHoursSaved: 118,
  recoveredRevenue: 712000,
};

export function calculateMetrics(config) {
  let { captureRate, walletAdoption, fraudApprovalRate, reconMatchRate, erpPostingSuccess, manualHoursSaved, recoveredRevenue } = BASE;

  if (config.expressWalletFirst) {
    captureRate += 0.044;
    walletAdoption += 0.101;
  }
  if (config.showTrustMessaging) {
    captureRate += 0.019;
  }
  if (config.showFeesEarly) {
    captureRate -= 0.033;
  }
  if (config.requireBillingAddress) {
    fraudApprovalRate += 0.011;
    captureRate -= 0.008;
  }
  if (!config.showPromoCode) {
    captureRate -= 0.014;
  }

  // Higher wallet adoption → lower fraud (tokenization benefit)
  const walletDelta = walletAdoption - BASE.walletAdoption;
  fraudApprovalRate += walletDelta * 0.09;

  // Fraud rate affects reconciliation (fewer chargebacks)
  const fraudDelta = fraudApprovalRate - BASE.fraudApprovalRate;
  reconMatchRate += fraudDelta * 0.28;

  // Recon affects ERP posting success
  const reconDelta = reconMatchRate - BASE.reconMatchRate;
  erpPostingSuccess += reconDelta * 0.22;

  const captureDelta = captureRate - BASE.captureRate;
  manualHoursSaved = Math.round(BASE.manualHoursSaved + captureDelta * 480 + reconDelta * 320);
  recoveredRevenue = Math.round(BASE.recoveredRevenue + captureDelta * 1_800_000 + reconDelta * 950_000);

  const clamp = (v) => Math.min(Math.max(v, 0), 1);

  return {
    captureRate: clamp(captureRate),
    walletAdoption: clamp(walletAdoption),
    fraudApprovalRate: clamp(fraudApprovalRate),
    reconMatchRate: clamp(reconMatchRate),
    erpPostingSuccess: clamp(erpPostingSuccess),
    manualHoursSaved,
    recoveredRevenue,
    // deltas vs baseline
    deltas: {
      captureRate: captureRate - BASE.captureRate,
      walletAdoption: walletAdoption - BASE.walletAdoption,
      fraudApprovalRate: fraudApprovalRate - BASE.fraudApprovalRate,
      reconMatchRate: reconMatchRate - BASE.reconMatchRate,
      erpPostingSuccess: erpPostingSuccess - BASE.erpPostingSuccess,
    },
  };
}

export function getVolumeTimeSeries() {
  const now = new Date('2026-05-03');
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const base = 420000 + Math.sin(i * 0.4) * 60000;
    const wallet = Math.round(base * (0.50 + Math.sin(i * 0.3) * 0.05));
    const card = Math.round(base - wallet);
    return { label, wallet, card, total: wallet + card };
  });
}

export function getDailyExceptions() {
  const now = new Date('2026-05-03');
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label,
      mismatch: Math.floor(2 + Math.random() * 4),
      missing: Math.floor(1 + Math.random() * 3),
      duplicate: Math.floor(Math.random() * 2),
    };
  });
}
