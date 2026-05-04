const BASE = {
  captureRate: 0.798,
  walletAdoption: 0.512,
  fraudApprovalRate: 0.921,
  reconMatchRate: 0.889,
  erpPostingSuccess: 0.954,
  manualHoursSaved: 118,
  recoveredRevenue: 712000,
};

// Per-category multipliers on individual config toggle effects.
// Values > 1 amplify a toggle's impact; < 1 dampen it.
const CATEGORY_MODIFIERS = {
  travel: {
    expressWalletFirst: 1.4,
    showScarcity: 1.5,
    showMoneyBack: 1.3,
    showInstallments: 0.8,
    showFeesEarly: 1.4,
    guestCheckoutEnabled: 1.2,
  },
  electronics: {
    showInstallments: 1.5,
    showReviews: 1.4,
    requireBillingAddress: 1.3,
    showSavings: 1.2,
    showMoneyBack: 1.2,
    expressWalletFirst: 0.9,
  },
  fitness: {
    showSavings: 1.4,
    showInstallments: 1.3,
    showMoneyBack: 1.3,
    showScarcity: 0.4,
    expressWalletFirst: 0.7,
  },
  grocery: {
    savedCardEnabled: 1.8,
    autoFillHints: 1.6,
    expressWalletFirst: 1.2,
    showScarcity: 0.3,
    showInstallments: 0.2,
    showTrustMessaging: 0.5,
    showMoneyBack: 0.5,
  },
  saas: {
    showSavings: 1.5,
    showMoneyBack: 1.4,
    showTrustMessaging: 1.2,
    showFeesEarly: 1.2,
    guestCheckoutEnabled: 0.5,
    showScarcity: 0.3,
  },
  events: {
    expressWalletFirst: 1.5,
    showScarcity: 1.8,
    requireBillingAddress: 1.4,
    savedCardEnabled: 1.3,
    showInstallments: 0.6,
    showMoneyBack: 0.4,
  },
  auto: {
    showReviews: 1.6,
    showMoneyBack: 1.5,
    showSavings: 1.3,
    showScarcity: 0.4,
    showInstallments: 0.8,
    expressWalletFirst: 0.7,
  },
  home: {
    showTrustMessaging: 1.5,
    showReviews: 1.7,
    showMoneyBack: 1.6,
    requireBillingAddress: 1.3,
    expressWalletFirst: 0.5,
    showScarcity: 0.3,
  },
};

function mod(category, key) {
  if (!category || !CATEGORY_MODIFIERS[category]) return 1.0;
  return CATEGORY_MODIFIERS[category][key] ?? 1.0;
}

export function calculateMetrics(config, category) {
  let { captureRate, walletAdoption, fraudApprovalRate, reconMatchRate, erpPostingSuccess, manualHoursSaved, recoveredRevenue } = BASE;

  // Wallet
  if (config.expressWalletFirst) {
    captureRate += 0.044 * mod(category, 'expressWalletFirst');
    walletAdoption += 0.101 * mod(category, 'expressWalletFirst');
  }
  if (config.savedCardEnabled) {
    captureRate += 0.036 * mod(category, 'savedCardEnabled');
    walletAdoption += 0.022 * mod(category, 'savedCardEnabled');
  }
  if (config.showPaymentIcons) {
    captureRate += 0.008 * mod(category, 'showPaymentIcons');
  }

  // Trust & social proof
  if (config.showTrustMessaging) {
    captureRate += 0.019 * mod(category, 'showTrustMessaging');
  }
  if (config.showReviews) {
    captureRate += 0.017 * mod(category, 'showReviews');
  }
  if (config.showScarcity) {
    captureRate += 0.011 * mod(category, 'showScarcity');
  }
  if (config.showMoneyBack) {
    captureRate += 0.014 * mod(category, 'showMoneyBack');
  }

  // Offer & pricing
  if (config.showFeesEarly) {
    captureRate -= 0.033 * mod(category, 'showFeesEarly');
  }
  if (config.showInstallments) {
    captureRate += 0.028 * mod(category, 'showInstallments');
    fraudApprovalRate -= 0.005 * mod(category, 'showInstallments');
  }
  if (config.showSavings) {
    captureRate += 0.013 * mod(category, 'showSavings');
  }
  if (!config.showPromoCode) {
    captureRate -= 0.014;
  }

  // Friction & conversion
  if (config.guestCheckoutEnabled) {
    captureRate += 0.039 * mod(category, 'guestCheckoutEnabled');
  }
  if (config.autoFillHints) {
    captureRate += 0.012 * mod(category, 'autoFillHints');
  }

  // Fraud prevention
  if (config.requireBillingAddress) {
    fraudApprovalRate += 0.011 * mod(category, 'requireBillingAddress');
    captureRate -= 0.008;
  }

  // Cascading effects
  const walletDelta = walletAdoption - BASE.walletAdoption;
  fraudApprovalRate += walletDelta * 0.09;

  const fraudDelta = fraudApprovalRate - BASE.fraudApprovalRate;
  reconMatchRate += fraudDelta * 0.28;

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
    deltas: {
      captureRate: captureRate - BASE.captureRate,
      walletAdoption: walletAdoption - BASE.walletAdoption,
      fraudApprovalRate: fraudApprovalRate - BASE.fraudApprovalRate,
      reconMatchRate: reconMatchRate - BASE.reconMatchRate,
      erpPostingSuccess: erpPostingSuccess - BASE.erpPostingSuccess,
    },
  };
}

export function getMetricsExplanation(config, product) {
  if (!product) {
    return { topDrivers: [], topTradeoffs: [] };
  }
  return {
    topDrivers: product.categoryInsights?.topDrivers ?? [],
    topTradeoffs: product.categoryInsights?.topTradeoffs ?? [],
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

const EXCEPTION_SEEDS = [3,4,2,5,3,4,2,3,4,5,3,2,4,3];
const MISSING_SEEDS  = [2,1,2,3,1,2,1,2,3,2,1,2,1,2];
const DUP_SEEDS      = [0,1,0,1,0,0,1,0,1,0,1,0,0,1];

export function getDailyExceptions() {
  const now = new Date('2026-05-03');
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, mismatch: EXCEPTION_SEEDS[i], missing: MISSING_SEEDS[i], duplicate: DUP_SEEDS[i] };
  });
}
