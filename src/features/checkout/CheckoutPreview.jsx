import { useState } from 'react';
import { Lock, Tag, ChevronDown, CreditCard, Shield, Star, Flame, RotateCcw, BadgeCheck } from 'lucide-react';

// Category-specific copy
const CATEGORY_COPY = {
  travel: {
    reviewText: 'Trusted by 12,400+ travelers',
    scarcityText: '14 people viewing · 3 seats left at this price',
    moneyBackText: 'Cancel up to 24h before — full refund',
    summaryLabel: 'Trip Summary',
  },
  electronics: {
    reviewText: 'Verified by 8,200+ buyers',
    scarcityText: '6 people viewing · 4 left in stock',
    moneyBackText: '30-day returns, no questions asked',
    summaryLabel: 'Order Summary',
  },
  fitness: {
    reviewText: 'Joined by 5,400+ members',
    scarcityText: 'Limited new member slots this month',
    moneyBackText: '30-day no-commitment trial period',
    summaryLabel: 'Membership Summary',
  },
  grocery: {
    reviewText: 'Used by 50,000+ households',
    scarcityText: 'Low stock on 2 items — order soon',
    moneyBackText: '100% satisfaction guarantee',
    summaryLabel: 'Cart Summary',
  },
  saas: {
    reviewText: 'Trusted by 25,000+ teams',
    scarcityText: 'Pricing increases at end of quarter',
    moneyBackText: '30-day free cancellation guarantee',
    summaryLabel: 'Plan Summary',
  },
  events: {
    reviewText: 'Rated 4.9 — 22,000+ ticket sales',
    scarcityText: 'Only 6 tickets remain at this price!',
    moneyBackText: 'Full refund if event is cancelled',
    summaryLabel: 'Ticket Details',
  },
  auto: {
    reviewText: 'Reviewed by 3,100+ verified buyers',
    scarcityText: 'Only 3 kits remaining at this price',
    moneyBackText: '30-day fitment guarantee or full return',
    summaryLabel: 'Parts Summary',
  },
  home: {
    reviewText: 'Trusted by 1,800+ homeowners',
    scarcityText: 'Contractor schedule fills 2 weeks out',
    moneyBackText: 'Deposit fully refundable within 48h',
    summaryLabel: 'Project Summary',
  },
};

const DEFAULT_COPY = {
  reviewText: 'Trusted by thousands of customers',
  scarcityText: '14 people viewing · Limited availability',
  moneyBackText: '30-day money-back guarantee',
  summaryLabel: 'Order Summary',
};

const DEFAULT_ITEM = {
  productName: 'Business Class — SFO → LHR',
  price: 2890.00,
  originalPrice: 3299.00,
  qty: 1,
  icon: '✈️',
};

function PaymentIcons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="h-6 px-2 flex items-center justify-center bg-white rounded text-[10px] font-black tracking-tighter text-blue-800 border border-gray-200">VISA</div>
      <div className="h-6 w-9 flex items-center justify-center rounded border border-gray-200 bg-white overflow-hidden">
        <svg viewBox="0 0 38 24" width="32">
          <circle cx="15" cy="12" r="9" fill="#EB001B" opacity="0.9"/>
          <circle cx="23" cy="12" r="9" fill="#F79E1B" opacity="0.9"/>
          <path d="M19 5.8A8.97 8.97 0 0 1 22.5 12 8.97 8.97 0 0 1 19 18.2 8.97 8.97 0 0 1 15.5 12 8.97 8.97 0 0 1 19 5.8z" fill="#FF5F00"/>
        </svg>
      </div>
      <div className="h-6 px-1.5 flex items-center justify-center bg-blue-600 rounded text-[9px] font-bold text-white border border-blue-700">AMEX</div>
      <div className="h-6 px-1.5 flex items-center justify-center bg-white rounded border border-gray-200 text-[9px] font-bold text-slate-700">
        DISC<span className="text-orange-500">●</span>VER
      </div>
    </div>
  );
}

function ApplePayButton({ onClick }) {
  return (
    <button
      onClick={() => onClick('Apple Pay')}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
      </svg>
      Pay with Apple Pay
    </button>
  );
}

function GooglePayButton({ onClick }) {
  return (
    <button
      onClick={() => onClick('Google Pay')}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-600 bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Pay with Google Pay
    </button>
  );
}

const INPUT_BASE = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500';

export default function CheckoutPreview({ config, onPay, cartItems, selectedProduct }) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [cardNum, setCardNum]     = useState('');
  const [expiry, setExpiry]       = useState('');
  const [cvv, setCvv]             = useState('');
  const [name, setName]           = useState('');
  const [useGuest, setUseGuest]   = useState(true);

  // Resolve items: use cartItems if provided, else fall back to selectedProduct or default
  const items = (cartItems && cartItems.length > 0)
    ? cartItems
    : selectedProduct
      ? [{ ...selectedProduct, qty: 1 }]
      : [DEFAULT_ITEM];

  const subtotal      = items.reduce((s, i) => s + i.price * i.qty, 0);
  const originalTotal = items.reduce((s, i) => s + ((i.originalPrice ?? i.price) * i.qty), 0);
  const savings       = originalTotal - subtotal;
  const processingFee = parseFloat((subtotal * 0.029 + 0.30).toFixed(2));
  const total         = subtotal + processingFee;
  const installment   = parseFloat((total / 4).toFixed(2));

  const isMobile = config.deviceSimulation === 'mobile' || config.deviceSimulation === 'android';
  const displayTotal = config.showFeesEarly ? total : subtotal;

  const cat = selectedProduct?.category;
  const copy = CATEGORY_COPY[cat] ?? DEFAULT_COPY;

  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">Checkout Preview</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {config.deviceSimulation === 'mobile'  ? '📱 iOS'
            : config.deviceSimulation === 'android' ? '📱 Android'
            : config.deviceSimulation === 'tablet'  ? '📲 Tablet'
            : '🖥 Desktop'}
          </span>
          <span className="badge-amber text-xs">DEMO — No real payments</span>
        </div>
      </div>

      {config.showReviews && (
        <div className="px-5 pt-4 pb-0 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
          </div>
          <span className="text-xs text-slate-300 font-medium">4.8</span>
          <span className="text-xs text-slate-500">· {copy.reviewText}</span>
        </div>
      )}

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} divide-y lg:divide-y-0 lg:divide-x divide-slate-800`}>

        {/* ── Payment column ─── */}
        <div className={`${isMobile ? 'w-full' : 'flex-1'} p-5 space-y-4`}>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">Payment</h2>
            {config.showTrustMessaging && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Lock size={11} />
                256-bit SSL secured
              </div>
            )}
          </div>

          {config.guestCheckoutEnabled && (
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs font-medium">
              <button
                onClick={() => setUseGuest(true)}
                className={`flex-1 py-2 transition-colors ${useGuest ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Continue as guest
              </button>
              <button
                onClick={() => setUseGuest(false)}
                className={`flex-1 py-2 transition-colors ${!useGuest ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Sign in
              </button>
            </div>
          )}

          {config.savedCardEnabled && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-400">Your saved payment method</div>
              <button
                onClick={() => onPay('Saved Card')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-blue-600/40 bg-blue-600/10 hover:bg-blue-600/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-blue-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-200">Visa ending in 4182</div>
                    <div className="text-xs text-slate-500">Expires 09/28</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-400">
                  Pay ${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </button>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex-1 h-px bg-slate-700" />
                or use a different card
                <div className="flex-1 h-px bg-slate-700" />
              </div>
            </div>
          )}

          {config.expressWalletFirst && (
            <div className="space-y-2">
              <ApplePayButton onClick={onPay} />
              <GooglePayButton onClick={onPay} />
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex-1 h-px bg-slate-700" />
                or pay with card
                <div className="flex-1 h-px bg-slate-700" />
              </div>
            </div>
          )}

          {config.autoFillHints && (
            <div className="flex items-center gap-2 text-xs text-blue-400/80 bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2">
              <RotateCcw size={11} />
              Your browser can autofill these fields
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Cardholder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete={config.autoFillHints ? 'cc-name' : 'off'}
              className={INPUT_BASE}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Card number"
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                autoComplete={config.autoFillHints ? 'cc-number' : 'off'}
                className={`${INPUT_BASE} pr-10`}
              />
              <CreditCard size={16} className="absolute right-3 top-3 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                autoComplete={config.autoFillHints ? 'cc-exp' : 'off'}
                className={INPUT_BASE.replace('w-full ', '')}
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                autoComplete={config.autoFillHints ? 'cc-csc' : 'off'}
                className={INPUT_BASE.replace('w-full ', '')}
              />
            </div>

            {config.requireBillingAddress && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Shield size={11} />
                  Billing Address (AVS verification)
                </div>
                <input type="text" placeholder="Street address"
                  autoComplete={config.autoFillHints ? 'street-address' : 'off'}
                  className={INPUT_BASE} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City"
                    autoComplete={config.autoFillHints ? 'address-level2' : 'off'}
                    className={INPUT_BASE.replace('w-full ', '')} />
                  <input type="text" placeholder="ZIP"
                    autoComplete={config.autoFillHints ? 'postal-code' : 'off'}
                    className={INPUT_BASE.replace('w-full ', '')} />
                </div>
              </div>
            )}
          </div>

          {!config.expressWalletFirst && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex-1 h-px bg-slate-700" />
                or express checkout
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <ApplePayButton onClick={onPay} />
              <GooglePayButton onClick={onPay} />
            </div>
          )}

          <button
            onClick={() => onPay('Card')}
            className="w-full btn-primary py-3 text-base font-semibold"
          >
            Pay ${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </button>

          {config.showInstallments && (
            <div className="text-center text-xs text-slate-400">
              or{' '}
              <span className="font-semibold text-slate-300">
                4 × ${installment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {' '}with interest-free installments
            </div>
          )}

          <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500">
            {config.showTrustMessaging && (
              <>
                <span className="flex items-center gap-1"><Lock size={10} />Secure</span>
                <span>·</span>
                <span>PCI DSS</span>
                <span>·</span>
              </>
            )}
            {config.showMoneyBack && (
              <span className="flex items-center gap-1 text-emerald-500/80">
                <BadgeCheck size={11} />
                {copy.moneyBackText}
              </span>
            )}
            {!config.showTrustMessaging && !config.showMoneyBack && (
              <span className="text-slate-700">No trust signals shown</span>
            )}
          </div>

          {config.showPaymentIcons && (
            <div className="flex justify-center">
              <PaymentIcons />
            </div>
          )}
        </div>

        {/* ── Order summary column ─── */}
        <div className={`${isMobile ? 'w-full' : 'w-72'} p-5 bg-slate-900/50 space-y-4`}>
          <div className="text-sm font-semibold text-slate-200">{copy.summaryLabel}</div>

          {config.showScarcity && (
            <div className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <Flame size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300">{copy.scarcityText}</span>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id ?? item.productName} className="flex justify-between gap-3">
                <div className="flex items-start gap-2">
                  {item.icon && <span className="text-base leading-tight mt-0.5">{item.icon}</span>}
                  <div className="text-xs text-slate-400 leading-relaxed">
                    {item.productName}
                    {item.qty > 1 && <span className="text-slate-500"> × {item.qty}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {config.showSavings && item.originalPrice && (
                    <div className="text-xs text-slate-600 line-through">
                      ${(item.originalPrice * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                  <div className="text-xs text-slate-200 font-medium">
                    ${(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {config.showSavings && savings > 0 && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs">
              <span className="text-emerald-400 font-medium">You save</span>
              <span className="text-emerald-400 font-bold">
                ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {config.showFeesEarly && (
              <div className="flex justify-between text-amber-400/80">
                <span>Processing fee (2.9% + $0.30)</span>
                <span>+${processingFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-100 pt-1 border-t border-slate-800">
              <span>Total</span>
              <span>${displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {config.showPromoCode && (
            <div>
              <button
                onClick={() => setPromoOpen(!promoOpen)}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <Tag size={12} />
                Have a promo code?
                <ChevronDown size={12} className={`transition-transform ${promoOpen ? 'rotate-180' : ''}`} />
              </button>
              {promoOpen && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button className="btn-primary text-xs px-3 py-2">Apply</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
