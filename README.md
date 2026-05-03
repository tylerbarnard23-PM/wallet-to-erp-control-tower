# PayOps Control Tower — Wallet-to-ERP Payment Operations Demo

> **Enterprise payments demo showing the full lifecycle from customer checkout to ERP journal posting.**

---

## Product Story

Modern payment operations involve at least five distinct teams working across five different systems — and decisions made at checkout ripple all the way to the accounting close. This demo makes that story visual and interactive.

When a payments team enables **Express Wallet First** on the checkout page:

1. **Capture rate rises** — fewer taps to pay means fewer abandonments
2. **Wallet adoption increases** — more Apple Pay / Google Pay usage
3. **Fraud approval rate improves** — tokenized wallet payments carry lower risk scores
4. **Reconciliation match rate improves** — fewer chargebacks means fewer exceptions
5. **ERP posting success rate improves** — clean settlements auto-post; exceptions require manual intervention

The Control Tower makes this chain of cause and effect visible to every stakeholder.

---

## Demo Sections

| Section | What it shows |
|---------|--------------|
| Dashboard | KPIs shift in real time as checkout config changes |
| Checkout Lab | Toggle wallet UX settings; see impact on metrics |
| Fraud Layer | 40 synthetic transactions with risk scores and signal breakdown |
| Reconciliation | 3-way match: Internal × Processor × Bank, with exception queue |
| Exception Detail | Root cause, audit trail, ERP impact, resolution workflow |
| ERP Simulator | SAP-style and Oracle-style journal entry preview and posting |
| Analytics | Funnel, trends, config vs. baseline impact table |

## Running the Demo

```bash
npm install
npm run dev     # http://localhost:5173
```

## Architecture

```
src/
  components/         Layout, Sidebar, MetricCard, Badge, Toggle
  context/            AppContext — checkout config state (useReducer)
  data/               transactions.js, reconciliation.js, erpPostings.js
  features/           One folder per section above
  services/           metricsService.js — config → KPI computation
  utils/              formatters.js
```

## Tech Stack

React 18 + Vite · TailwindCSS v3 · React Router v6 · Recharts · Lucide React

## Data

**100% synthetic demo data.** No real card numbers, wallet tokens, PII, or live API calls.
