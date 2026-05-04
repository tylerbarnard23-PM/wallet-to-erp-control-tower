import { createContext, useContext, useReducer } from 'react';
import { PRODUCT_CATALOG } from '../data/productCatalog';

export const defaultConfig = {
  expressWalletFirst: true,
  savedCardEnabled: false,
  showPaymentIcons: false,
  deviceSimulation: 'mobile',
  showTrustMessaging: true,
  showReviews: false,
  showScarcity: false,
  showMoneyBack: false,
  showFeesEarly: false,
  showInstallments: false,
  showSavings: false,
  showPromoCode: true,
  guestCheckoutEnabled: false,
  autoFillHints: false,
  requireBillingAddress: false,
};

const defaultProduct = PRODUCT_CATALOG[0];

const initialState = {
  config: defaultConfig,
  selectedCategory: defaultProduct.category,
  selectedProduct: defaultProduct,
  cartItems: [],
  activeTrainingScenario: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_CONFIG':
      return { ...state, config: { ...state.config, [action.key]: !state.config[action.key] } };
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, [action.key]: action.value } };
    case 'RESET_CONFIG':
      return { ...state, config: defaultConfig };
    case 'APPLY_CONFIG':
      return { ...state, config: { ...defaultConfig, ...action.config } };
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.categoryId };
    case 'SELECT_PRODUCT':
      return {
        ...state,
        selectedProduct: action.product,
        selectedCategory: action.product.category,
      };
    case 'ADD_TO_CART': {
      const existing = state.cartItems.find(i => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          cartItems: state.cartItems.map(i =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
          selectedProduct: action.product,
          selectedCategory: action.product.category,
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.product, qty: 1 }],
        selectedProduct: action.product,
        selectedCategory: action.product.category,
      };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cartItems: state.cartItems.filter(i => i.id !== action.productId) };
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    case 'SET_SCENARIO':
      return { ...state, activeTrainingScenario: action.scenario };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Config actions (backward compatible)
  const toggle = (key) => dispatch({ type: 'TOGGLE_CONFIG', key });
  const set = (key, value) => dispatch({ type: 'SET_CONFIG', key, value });
  const reset = () => dispatch({ type: 'RESET_CONFIG' });
  const applyConfig = (cfg) => dispatch({ type: 'APPLY_CONFIG', config: cfg });

  // Product / cart actions
  const selectCategory = (categoryId) => dispatch({ type: 'SELECT_CATEGORY', categoryId });
  const selectProduct = (product) => dispatch({ type: 'SELECT_PRODUCT', product });
  const addToCart = (product) => dispatch({ type: 'ADD_TO_CART', product });
  const removeFromCart = (productId) => dispatch({ type: 'REMOVE_FROM_CART', productId });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  // Scenario actions
  const setTrainingScenario = (scenario) => {
    dispatch({ type: 'SET_SCENARIO', scenario });
    if (scenario?.productId) {
      const product = PRODUCT_CATALOG.find(p => p.id === scenario.productId);
      if (product) {
        dispatch({ type: 'SELECT_PRODUCT', product });
        dispatch({ type: 'CLEAR_CART' });
        dispatch({ type: 'ADD_TO_CART', product });
      }
    }
    if (scenario?.config) {
      dispatch({ type: 'APPLY_CONFIG', config: scenario.config });
    }
  };

  const applyRecommendedConfig = () => {
    if (state.selectedProduct?.recommendedConfig) {
      dispatch({ type: 'APPLY_CONFIG', config: state.selectedProduct.recommendedConfig });
    }
  };

  return (
    <AppContext.Provider value={{
      config: state.config,
      selectedCategory: state.selectedCategory,
      selectedProduct: state.selectedProduct,
      cartItems: state.cartItems,
      activeTrainingScenario: state.activeTrainingScenario,
      toggle, set, reset,
      applyConfig,
      selectCategory, selectProduct,
      addToCart, removeFromCart, clearCart,
      setTrainingScenario, applyRecommendedConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
