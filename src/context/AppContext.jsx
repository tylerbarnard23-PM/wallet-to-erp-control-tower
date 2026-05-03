import { createContext, useContext, useReducer } from 'react';

export const defaultConfig = {
  // Wallet
  expressWalletFirst: true,
  savedCardEnabled: false,
  showPaymentIcons: false,
  deviceSimulation: 'mobile',
  // Trust & social proof
  showTrustMessaging: true,
  showReviews: false,
  showScarcity: false,
  showMoneyBack: false,
  // Offer & pricing
  showFeesEarly: false,
  showInstallments: false,
  showSavings: false,
  showPromoCode: true,
  // Friction & conversion
  guestCheckoutEnabled: false,
  autoFillHints: false,
  // Fraud prevention
  requireBillingAddress: false,
};

function configReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.key]: !state[action.key] };
    case 'SET':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return defaultConfig;
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [config, dispatch] = useReducer(configReducer, defaultConfig);

  const toggle = (key) => dispatch({ type: 'TOGGLE', key });
  const set = (key, value) => dispatch({ type: 'SET', key, value });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <AppContext.Provider value={{ config, toggle, set, reset }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
