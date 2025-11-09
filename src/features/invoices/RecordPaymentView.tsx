import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useInvoiceDetail } from './useInvoiceDetail';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';

export function RecordPaymentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, loading, error } = useInvoiceDetail(id);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('');
  const [currency, setCurrency] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize currency from invoice if not set
  useEffect(() => {
    if (invoice && !currency) {
      const invoiceCurrency = invoice.total?.currency || invoice.balance?.currency || 'USD';
      setCurrency(invoiceCurrency);
    }
  }, [invoice, currency]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !invoice) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setSubmitError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > (invoice.balance?.amount ?? 0)) {
      setSubmitError('Payment amount cannot exceed the outstanding balance');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload: {
        amount: number;
        paymentDate: string;
        method: string;
        currency: string;
        reference?: string;
        notes?: string;
      } = {
        amount: paymentAmount,
        paymentDate,
        method,
        currency,
      };

      // Add notes if provided
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await apiClient.post(`/api/invoices/${id}/payments`, payload);

      setSuccess(true);
      // Redirect to invoice detail after 2 seconds
      setTimeout(() => {
        navigate(`/invoices/${id}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setSubmitError(errorMessage);
      console.error('Record payment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">
            {error || 'Invoice not found'}
          </div>
          <Link to="/invoices" className="mt-4 block">
            <Button variant="secondary">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = invoice.total?.amount ?? 0;
  const outstandingBalance = invoice.balance?.amount ?? 0;
  const paidAmount = totalAmount - outstandingBalance;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to={`/invoices/${invoice.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Invoice
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Record Payment</h1>
        <p className="mt-2 text-muted-foreground">Record a payment for invoice {invoice.invoiceNumber}</p>
      </div>

      {success ? (
        <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            Payment recorded successfully!
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Redirecting to invoice details...
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Invoice Summary */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Invoice Summary</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Invoice Number</div>
                <div className="mt-1 font-semibold">{invoice.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customer ID</div>
                <div className="mt-1 text-sm">{invoice.customerId}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-muted-foreground">Subtotal</div>
                <div className="text-sm">
                  ${(invoice.subtotal?.amount ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                  Tax {invoice.taxRate ? `(${(invoice.taxRate * 100).toFixed(1)}%)` : ''}
                </div>
                <div className="text-sm">
                  ${(invoice.tax?.amount ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                  <div className="font-semibold">
                    ${totalAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm font-medium text-muted-foreground">Paid Amount</div>
                <div>
                  ${paidAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <div className="text-base font-semibold">Remaining Balance</div>
                  <div className="text-base font-bold">
                    ${outstandingBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Payment Amount <span className="text-destructive">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstandingBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="0.00"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: ${outstandingBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="paymentDate" className="text-sm font-medium">
                  Payment Date <span className="text-destructive">*</span>
                </label>
                <input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="method" className="text-sm font-medium">
                  Payment Method <span className="text-destructive">*</span>
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                >
                  <option value="">Select payment method</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="WIRE_TRANSFER">Wire Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="currency" className="text-sm font-medium">
                  Currency <span className="text-destructive">*</span>
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  disabled={submitting}
                >
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Optional notes about this payment..."
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Recording...' : 'Record Payment'}
                </Button>
                <Link to={`/invoices/${invoice.id}`}>
                  <Button type="button" variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

