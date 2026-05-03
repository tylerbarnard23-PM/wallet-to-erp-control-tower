import { createContext, useContext, useReducer } from 'react';

export const defaultConfig = {
  expressWalletFirst: true,
  requireBillingAddress: false,
  showTrustMessaging: true,
  showFeesEarly: false,
  deviceSimulation: 'mobile',
  showPromoCode: true,
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
