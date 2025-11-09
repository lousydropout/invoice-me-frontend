import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { InvoicesView } from '@/features/invoices/InvoicesView';
import { InvoiceDetailView } from '@/features/invoices/InvoiceDetailView';
import { SendInvoiceView } from '@/features/invoices/SendInvoiceView';
import { RecordPaymentView } from '@/features/invoices/RecordPaymentView';
import { CustomersView } from '@/features/customers/CustomersView';
import { CustomerDetailView } from '@/features/customers/CustomerDetailView';
import { HealthView } from '@/features/health/HealthView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route: Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout>
                <DashboardView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/invoices"
          element={
            <AuthGuard>
              <Layout>
                <InvoicesView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <AuthGuard>
              <Layout>
                <InvoiceDetailView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/invoices/:id/send"
          element={
            <AuthGuard>
              <Layout>
                <SendInvoiceView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/invoices/:id/payment"
          element={
            <AuthGuard>
              <Layout>
                <RecordPaymentView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/customers"
          element={
            <AuthGuard>
              <Layout>
                <CustomersView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <AuthGuard>
              <Layout>
                <CustomerDetailView />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/health"
          element={
            <AuthGuard>
              <Layout>
                <HealthView />
              </Layout>
            </AuthGuard>
          }
        />

        {/* Catch all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
