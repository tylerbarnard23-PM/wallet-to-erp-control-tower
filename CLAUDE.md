# Wallet-to-ERP Payment Ops Control Tower — CLAUDE.md

## Project Purpose
Enterprise-grade payment operations demo showing the full lifecycle from wallet checkout through fraud scoring, settlement reconciliation, and ERP journal posting. **All data is synthetic/demo only.**

## Key Rules
- Never use real card numbers, real wallet tokens, real PII, or live payment credentials
- All merchants, customers, and transactions are fictional demo data
- Apple Pay and Google Pay buttons are mock UI only — no actual payment SDK
- ERP views are "SAP-style" and "Oracle-style" — not copied branded UI
- SAP/Oracle are not mentioned as logos or used as actual integrations

## Folder Structure
```
src/
  components/       Reusable UI (Badge, Toggle, MetricCard, Layout, Sidebar)
  context/          AppContext.jsx — global checkout config state via useReducer
  data/             Static demo data (transactions, reconciliation, erpPostings)
  features/
    dashboard/      Executive KPI overview
    checkout/       Checkout Experience Lab with config panel + live preview
    fraud/          Fraud score, risk signals, approve/review/decline
    reconciliation/ Match internal orders vs processor vs bank
    exceptions/     Root cause, audit trail, ERP impact, resolution workflow
    erp/            SAP-style and Oracle-style journal entry posting simulator
    analytics/      Checkout funnel, trends, config impact table
  services/
    metricsService.js   Derives dashboard KPIs from checkout config
  utils/
    formatters.js   fmt.currency, fmt.pct, statusBadge, riskColor helpers
```

## Config-Driven Metrics
The `AppContext` holds `checkoutConfig`. Changes flow through `metricsService.calculateMetrics(config)` to update:
- Capture rate (expressWalletFirst, showTrustMessaging, showFeesEarly, showPromoCode)
- Wallet adoption (expressWalletFirst, deviceSimulation)
- Fraud approval rate (requireBillingAddress, walletAdoption)
- Recon match rate (derived from fraud rate → fewer chargebacks)
- ERP posting success (derived from recon match rate)

## Tech Stack
- React 18 + Vite 6
- TailwindCSS v3 (dark enterprise theme, slate-950 background)
- React Router v6 (nested routes via Layout + Outlet)
- Recharts (AreaChart, BarChart, PieChart, LineChart)
- Lucide React (icons)
- clsx (conditional classes)

## Running
```bash
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Adding New Features
- New demo data: add to `src/data/`
- New metric: update `src/services/metricsService.js` and `Dashboard.jsx`
- New page: add to `src/features/`, add route in `App.jsx`, add nav item in `Sidebar.jsx`
- New reusable component: add to `src/components/`

## Demo Story
The main narrative: **checkout configuration choices have a cascading effect on fraud approval rates, reconciliation exceptions, and ERP posting success.** This is visible on the Dashboard (KPI deltas vs baseline) and the Analytics page (funnel + config impact table).
