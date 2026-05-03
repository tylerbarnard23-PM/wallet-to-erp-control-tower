import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import CheckoutLab from './features/checkout/CheckoutLab';
import FraudLayer from './features/fraud/FraudLayer';
import ReconciliationWorkbench from './features/reconciliation/ReconciliationWorkbench';
import ExceptionDetail from './features/exceptions/ExceptionDetail';
import ERPSimulator from './features/erp/ERPSimulator';
import Analytics from './features/analytics/Analytics';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="checkout" element={<CheckoutLab />} />
            <Route path="fraud" element={<FraudLayer />} />
            <Route path="reconciliation" element={<ReconciliationWorkbench />} />
            <Route path="exceptions/:id" element={<ExceptionDetail />} />
            <Route path="erp" element={<ERPSimulator />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
