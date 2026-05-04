# PayOps Control Tower — Checkout Conversion Training Studio

> **An interactive training tool for understanding how checkout design decisions affect conversion, wallet adoption, fraud outcomes, reconciliation quality, and ERP posting success.**

**Live demo:** https://tylerbarnard23-pm.github.io/wallet-to-erp-control-tower/

---

## What This Is

This is a simulation environment — not a production payment system, not a benchmarking tool, and not a guarantee of any specific outcome. It's a training aid built around a core idea: **checkout decisions don't just affect conversion. They have a cascading effect all the way through fraud scoring, reconciliation, and accounting.**

The tool lets you act as an internal payments or product team. You configure a checkout experience in the Training Studio, and a simulated customer storefront updates in real time to reflect those choices. The KPI panels then show how those decisions are expected to directionally shift the metrics that matter.

The metric responses are modeled on widely-documented checkout behaviors — things like the effect of wallet-first ordering on mobile conversion, the friction cost of early fee disclosure, or the fraud-reduction benefit of tokenized payments. The numbers are illustrative, not predictive. Your actual results will depend on your audience, your platform, your product category, and dozens of factors this tool doesn't model.

Use it to build intuition, not to forecast.

---

## The Core Idea: Checkout Decisions Cascade

When a payments team enables **Express Wallet First** on a mobile checkout:

1. **Capture rate rises** — fewer taps to complete payment means fewer drop-offs
2. **Wallet adoption increases** — Apple Pay and Google Pay usage goes up
3. **Fraud approval rate improves** — tokenized wallet payments carry lower risk scores than raw card entry
4. **Reconciliation match rate improves** — fewer chargebacks means fewer settlement exceptions
5. **ERP posting success rate improves** — clean, matched settlements auto-post to the GL; exceptions require manual intervention

That's the chain this tool makes visible. Every toggle you flip in the Training Studio propagates through that chain, and the downstream effects show up on the Dashboard, Analytics, Fraud, Reconciliation, and ERP pages.

---

## Training Studio

The Training Studio (`/checkout`) is the center of the learning experience.

### Scenario Presets

Seven pre-built scenarios load a product, configure the checkout, and surface teaching notes explaining what to watch for:

| Scenario | Core lesson |
|----------|-------------|
| High AOV Electronics | BNPL and reviews overcome price anxiety; billing address balances fraud risk |
| Mobile Travel Booking | Wallet-first is transformative for high-AOV mobile purchases |
| SaaS Trial → Annual | Annual savings callout and a guarantee drive plan upgrades |
| Grocery Reorder | Speed is the only metric that matters; remove every unnecessary tap |
| Event Ticket Rush | Genuine scarcity plus wallet tokenization filters bots |
| Auto Parts Fitment | Reviews that confirm compatibility reduce returns and chargebacks |
| Home Service Deposit | At this anxiety level, every trust signal earns its place |

Click a scenario and the product, cart, and checkout config all update at once. The Training Insights panel explains what's driving the expected outcome for that category.

### Category Modifiers

Not all checkout toggles have equal impact across product types. The tool models this:

- **Scarcity messaging** lifts event ticket conversions significantly but has little effect on grocery or auto parts
- **Installment options** are especially powerful for high-ticket electronics; less so for $87 grocery bundles
- **Money-back guarantees** matter most for subscriptions and home service deposits, where commitment anxiety is high
- **Wallet-first ordering** is most impactful on mobile travel bookings; less so for deliberate desktop purchases like home remodel deposits

The KPI panels reflect these differences. The same toggle produces different magnitude effects depending on what's in the cart.

### Apply Recommended Config

Each product category has a recommended checkout configuration based on its typical buyer profile, fraud risk, and average order value. The "Apply recommended config" button loads that configuration so you can see what a well-tuned checkout might look like for that category — and compare it against a poorly-tuned one.

### What the Numbers Mean

The metric deltas shown in the Training Studio and Dashboard are directional estimates derived from the active configuration. They are based on the kinds of effects documented across the payments and checkout optimization literature — not your data, not controlled experiments run on your platform.

A "+8pp capture rate" shown for a wallet-first mobile travel scenario means: *based on how this category behaves and what the research suggests about wallet adoption on mobile, this configuration is expected to outperform a less optimized baseline by roughly that magnitude.* It does not mean you will see exactly that lift if you deploy these settings.

Treat the numbers as a learning frame, not a projection.

---

## Storefront

The Storefront (`/storefront`) shows the customer-facing side of what the Training Studio configures.

Browse products across eight categories, add to cart, and proceed to checkout. The checkout reflects whatever configuration is currently active in the Training Studio — so if you've turned on wallet-first ordering, reviews, and a money-back guarantee, those appear in the storefront checkout immediately.

This is the point of the two-panel design: operators configure on the inside, customers experience on the outside. The training value is in watching both sides change simultaneously.

---

## The Full Ops Story

The tool preserves the original wallet-to-ERP narrative even as it expands the training scope. The story runs in both directions:

**Forward (checkout → ERP):**
Better checkout config → higher capture rate → more wallet adoption → lower fraud scores → fewer reconciliation exceptions → cleaner ERP posting → faster month-end close

**Backward (ERP → checkout):**
High exception volume in ERP? Check reconciliation match rates. High mismatch rate? Look at fraud approval patterns. High fraud decline rate? Look at wallet adoption. Low wallet adoption? Look at checkout configuration.

The Dashboard and Analytics pages make this chain visible across all seven sections of the tool.

---

## Sections

| Section | What it shows |
|---------|--------------|
| Dashboard | KPIs shift in real time as config and category change |
| Storefront | Customer-facing product catalog with cart and live checkout |
| Training Studio | Scenario presets, config toggles, training insights, live KPI impact |
| Fraud Layer | 40 synthetic transactions with risk scores and signal breakdown |
| Reconciliation | 3-way match: Internal × Processor × Bank, with exception queue |
| Exception Detail | Root cause, audit trail, ERP impact, resolution workflow |
| ERP Simulator | SAP-style and Oracle-style journal entry preview and posting |
| Analytics | Funnel, trends, config vs. baseline impact table |

---

## Running Locally

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build
```

---

## Architecture

```
src/
  components/         Layout, Sidebar, MobileNav, MetricCard, Badge, Toggle
  context/            AppContext — config + cart + product + scenario state
  data/               productCatalog.js, trainingScenarios.js,
                      transactions.js, reconciliation.js, erpPostings.js
  features/
    storefront/       Customer-facing product catalog and checkout
    checkout/         TrainingStudio, CheckoutPreview
    dashboard/        KPI overview
    fraud/            Risk scores, signal breakdown, decision table
    reconciliation/   3-way match workbench
    exceptions/       Exception queue, root cause, audit trail
    erp/              SAP-style and Oracle-style journal posting simulator
    analytics/        Funnel, trends, config impact table
  services/           metricsService.js — config + category → KPI computation
  utils/              formatters.js
```

---

## Tech Stack

React 19 + Vite · TailwindCSS v3 · React Router v7 · Recharts · Lucide React

---

## Data and Limitations

**100% synthetic.** No real card numbers, wallet tokens, customer PII, or live API calls anywhere in this tool.

The metric model in `metricsService.js` is a simplified, opinionated representation of checkout optimization effects. It does not account for seasonality, device mix, traffic source, pricing elasticity, brand trust, or the many other variables that affect real checkout performance. The category modifiers are illustrative approximations, not regression coefficients from a controlled study.

This tool is useful for building shared understanding on a team, for running through "what if" conversations, and for onboarding people to the payments-to-ERP lifecycle. It is not a substitute for A/B testing, analytics instrumentation, or working with your actual transaction data.
