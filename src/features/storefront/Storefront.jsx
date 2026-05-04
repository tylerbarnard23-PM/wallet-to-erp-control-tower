import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ShoppingCart, Settings, ChevronLeft, Plus, Check,
  Star, Shield, Zap, ArrowRight, X,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { PRODUCT_CATALOG, CATEGORIES } from '../../data/productCatalog';
import CheckoutPreview from '../checkout/CheckoutPreview';

function ProductCard({ product, onAddToCart, inCart, onSelect, isSelected }) {
  return (
    <div
      className={`card cursor-pointer overflow-hidden transition-all hover:border-slate-600 ${
        isSelected ? 'border-blue-500/50 ring-1 ring-blue-500/30' : ''
      }`}
      onClick={() => onSelect(product)}
    >
      {/* Product image area */}
      <div className={`h-32 flex items-center justify-center bg-gradient-to-br ${product.color} relative`}>
        <span className="text-5xl">{product.icon}</span>
        {product.originalPrice && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            SALE
          </div>
        )}
        {product.fraudRiskProfile === 'high' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Shield size={10} />
            Protected
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4 space-y-2">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{product.categoryLabel}</div>
        <div className="text-sm font-semibold text-slate-100 leading-snug">{product.productName}</div>
        <div className="text-xs text-slate-400 leading-relaxed line-clamp-2">{product.description}</div>

        {/* Price row */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-100">
            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-slate-500 line-through">
              ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs text-slate-500">4.8</span>
        </div>

        {/* Add to cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className={`w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            inCart
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {inCart ? (
            <>
              <Check size={14} />
              Added to cart
            </>
          ) : (
            <>
              <Plus size={14} />
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ProductDetail({ product, onAddToCart, inCart, onClose }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between card-header">
        <div className="text-sm font-semibold text-slate-200">Product Detail</div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X size={16} />
        </button>
      </div>
      <div className={`h-48 flex items-center justify-center bg-gradient-to-br ${product.color}`}>
        <span className="text-8xl">{product.icon}</span>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{product.categoryLabel} · {product.merchantName}</div>
          <div className="text-xl font-bold text-slate-100">{product.productName}</div>
          <div className="text-sm text-slate-400 mt-1">{product.description}</div>
          {product.extraDescription && (
            <div className="text-xs text-blue-400 mt-1">{product.extraDescription}</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-slate-100">
            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-slate-500 line-through">
                ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Save ${(product.originalPrice - product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
          <span className={`px-2 py-1 rounded-full font-medium border ${
            product.buyerAnxietyLevel === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
            product.buyerAnxietyLevel === 'medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
            'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
          }`}>
            {product.buyerAnxietyLevel} buyer anxiety
          </span>
          <span className={`px-2 py-1 rounded-full font-medium border ${
            product.walletEligibility === 'strong' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
            product.walletEligibility === 'medium' ? 'border-slate-500/30 text-slate-400 bg-slate-500/10' :
            'border-slate-600/30 text-slate-500 bg-slate-600/10'
          }`}>
            wallet: {product.walletEligibility}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all ${
            inCart
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {inCart ? <><Check size={16} /> Added to cart</> : <><Plus size={16} /> Add to cart</>}
        </button>
      </div>
    </div>
  );
}

export default function Storefront() {
  const navigate = useNavigate();
  const { config, cartItems, addToCart, removeFromCart, clearCart, selectedProduct, selectProduct } = useAppContext();
  const [filterCategory, setFilterCategory] = useState(null);
  const [view, setView] = useState('catalog'); // 'catalog' | 'checkout'
  const [detailProduct, setDetailProduct] = useState(null);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const visibleProducts = filterCategory
    ? PRODUCT_CATALOG.filter(p => p.category === filterCategory)
    : PRODUCT_CATALOG;

  function handleAddToCart(product) {
    addToCart(product);
  }

  function handleSelectProduct(product) {
    setDetailProduct(product === detailProduct ? null : product);
    selectProduct(product);
  }

  const activeConfig = config;
  const configCount = Object.entries(activeConfig).filter(([k, v]) => v === true).length;

  if (view === 'checkout') {
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Storefront header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setView('catalog')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back to store</span>
              <span className="sm:hidden">Store</span>
            </button>
            <div className="text-sm font-semibold text-slate-200">Checkout</div>
            <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1">
              <Settings size={10} />
              <span className="hidden sm:inline">{configCount} config</span>
              <span className="sm:hidden">{configCount}</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CheckoutPreview
                config={activeConfig}
                cartItems={cartItems}
                selectedProduct={selectedProduct ?? (cartItems[0] || null)}
                onPay={(method) => {
                  alert(`Demo: Payment initiated via ${method}. No real transaction.`);
                }}
              />
            </div>

            {/* Training sidebar */}
            <div className="space-y-4">
              {/* Cart summary */}
              <div className="card">
                <div className="card-header text-sm font-semibold text-slate-200">
                  Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </div>
                <div className="card-body space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-300 truncate">{item.productName}</div>
                        <div className="text-xs text-slate-500">× {item.qty}</div>
                      </div>
                      <div className="text-xs font-medium text-slate-200">
                        ${(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-semibold text-slate-100">
                    <span>Total</span>
                    <span>${cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Active config notice */}
              <div className="card border-blue-500/20 bg-blue-500/5">
                <div className="card-header flex items-center gap-2">
                  <Settings size={13} className="text-blue-400" />
                  <div className="text-xs font-semibold text-blue-400">Active Checkout Config</div>
                </div>
                <div className="card-body">
                  <div className="space-y-1 mb-3">
                    {Object.entries(activeConfig)
                      .filter(([, v]) => v === true)
                      .slice(0, 6)
                      .map(([k]) => (
                        <div key={k} className="flex items-center gap-2 text-xs text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </div>
                      ))}
                    {Object.entries(activeConfig).filter(([, v]) => v === true).length > 6 && (
                      <div className="text-xs text-slate-500">
                        +{Object.entries(activeConfig).filter(([, v]) => v === true).length - 6} more
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full text-xs py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-1"
                  >
                    Modify in Training Studio
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 lg:pb-0">
      {/* Storefront header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">PayOps Store</div>
              <div className="text-xs text-slate-500 hidden sm:block">Customer-facing experience</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1.5">
              <Settings size={11} />
              {configCount} config active
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <Zap size={11} />
              Training Studio
            </button>
            {cartCount > 0 && (
              <button
                onClick={() => setView('checkout')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <ShoppingCart size={14} />
                <span>{cartCount}</span>
                <span className="hidden sm:inline">— ${cartTotal.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <div className="bg-slate-900/70 border-b border-slate-800 sticky top-[65px] z-10 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setFilterCategory(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !filterCategory ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id === filterCategory ? null : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Training context banner */}
        <div className="mb-5 flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Zap size={13} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200">This is the customer-facing storefront</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Checkout config is set in <button onClick={() => navigate('/checkout')} className="text-blue-400 hover:underline">Training Studio</button> — changes there update the checkout below in real time.
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="hidden sm:flex flex-shrink-0 items-center gap-1.5 text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            Open Studio
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={detailProduct?.id === product.id}
                  onSelect={handleSelectProduct}
                  onAddToCart={handleAddToCart}
                  inCart={cartItems.some(i => i.id === product.id)}
                />
              ))}
            </div>
          </div>

          {/* Desktop right panel: product detail or cart */}
          {(detailProduct || cartCount > 0) && (
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
              {detailProduct && (
                <ProductDetail
                  product={detailProduct}
                  inCart={cartItems.some(i => i.id === detailProduct.id)}
                  onAddToCart={handleAddToCart}
                  onClose={() => setDetailProduct(null)}
                />
              )}
              {cartCount > 0 && (
                <div className="card">
                  <div className="card-header text-sm font-semibold text-slate-200">
                    Cart ({cartCount})
                  </div>
                  <div className="card-body space-y-2">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-300 truncate">{item.productName}</div>
                        </div>
                        <div className="text-xs font-medium text-slate-200 flex-shrink-0">
                          ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-sm font-semibold text-slate-100 mb-3">
                        <span>Total</span>
                        <span>${cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button
                        onClick={() => setView('checkout')}
                        className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full mt-2 text-xs text-slate-500 hover:text-slate-400"
                      >
                        Clear cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky cart bar */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-3 flex items-center gap-3 z-20">
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-100">{cartCount} {cartCount === 1 ? 'item' : 'items'}</div>
            <div className="text-xs text-slate-400">${cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <button
            onClick={() => setView('checkout')}
            className="btn-primary px-5 py-2.5 flex items-center gap-2"
          >
            Checkout
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
