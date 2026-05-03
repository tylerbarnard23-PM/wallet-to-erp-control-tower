import { useState } from 'react';
import { Lock, Tag, ChevronDown, CreditCard, Shield } from 'lucide-react';

const ORDER_ITEMS = [
  { name: 'Business Class — SFO → LHR', qty: 1, price: 2890.00 },
  { name: 'Travel Insurance Add-on', qty: 1, price: 89.00 },
];

const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
const processingFee = parseFloat((subtotal * 0.029 + 0.30).toFixed(2));
const total = subtotal + processingFee;

function ApplePayButton({ onClick }) {
  return (
    <button
      onClick={() => onClick('Apple Pay')}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Pay with Google Pay
    </button>
  );
}

export default function CheckoutPreview({ config, onPay }) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const isMobile = config.deviceSimulation === 'mobile' || config.deviceSimulation === 'android';

  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">Checkout Preview</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{
            config.deviceSimulation === 'mobile' ? '📱 iOS' :
            config.deviceSimulation === 'android' ? '📱 Android' :
            config.deviceSimulation === 'tablet' ? '📲 Tablet' : '🖥 Desktop'
          }</span>
          <span className="badge-amber text-xs">DEMO — No real payments</span>
        </div>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} divide-y lg:divide-y-0 lg:divide-x divide-slate-800`}>
        {/* Payment section */}
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

          {/* Wallet buttons */}
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

          {/* Card form */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Cardholder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Card number"
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-10"
              />
              <CreditCard size={16} className="absolute right-3 top-3 text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {config.requireBillingAddress && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Shield size={11} />
                  Billing Address (required for AVS)
                </div>
                <input type="text" placeholder="Street address" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                  <input type="text" placeholder="ZIP" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            )}
          </div>

          {/* Non-express wallet (below card) */}
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
            Pay ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </button>

          {config.showTrustMessaging && (
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Lock size={10} />Secure</span>
              <span>•</span>
              <span>PCI DSS Compliant</span>
              <span>•</span>
              <span>Fraud Protected</span>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className={`${isMobile ? 'w-full' : 'w-72'} p-5 bg-slate-900/50 space-y-4`}>
          <div className="text-sm font-semibold text-slate-200">Order Summary</div>

          <div className="space-y-3">
            {ORDER_ITEMS.map((item) => (
              <div key={item.name} className="flex justify-between gap-3">
                <div className="text-xs text-slate-400 leading-relaxed">{item.name}</div>
                <div className="text-xs text-slate-200 whitespace-nowrap font-medium">
                  ${(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

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
              <span>${(config.showFeesEarly ? total : subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
