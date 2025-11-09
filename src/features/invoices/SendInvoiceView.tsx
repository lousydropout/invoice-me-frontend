import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useInvoiceDetail } from './useInvoiceDetail';
import { useCustomerDetail } from '@/features/customers/useCustomerDetail';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';

export function SendInvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoice, loading, error } = useInvoiceDetail(id);
  const { customer, loading: customerLoading } = useCustomerDetail(invoice?.customerId);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!id || !invoice) return;

    try {
      setSending(true);
      setSendError(null);

      await apiClient.post(`/api/invoices/${id}/send`);

      setSuccess(true);
      // Redirect to invoice detail after 2 seconds
      setTimeout(() => {
        navigate(`/invoices/${id}`);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invoice';
      setSendError(errorMessage);
      console.error('Send invoice error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading || customerLoading) {
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to={`/invoices/${invoice.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Invoice
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Send Invoice</h1>
        <p className="mt-2 text-muted-foreground">Review invoice before sending</p>
      </div>

      {success ? (
        <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            Invoice sent successfully!
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            Redirecting to invoice details...
          </p>
        </div>
      ) : (
        <>
          {/* Invoice Preview */}
          <div className="mb-6 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Invoice</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Invoice Number</div>
                  <div className="mt-1 font-semibold">{invoice.invoiceNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        invoice.status === 'PAID'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : invoice.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer Name</div>
                  <div className="mt-1 text-sm font-medium">
                    {customer?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer Email</div>
                  <div className="mt-1 text-sm">
                    {customer?.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-primary hover:underline"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Customer ID</div>
                  <div className="mt-1 text-sm">{invoice.customerId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                  <div className="mt-1 text-sm">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {invoice.lineItems && invoice.lineItems.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Line Items</div>
                  <div className="space-y-2">
                    {invoice.lineItems.map((item, index) => (
                      <div key={`line-item-${index}`} className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span>{item.description}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {invoice.sentDate
                              ? `Sent: ${new Date(invoice.sentDate).toLocaleDateString()}`
                              : `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`}
                          </span>
                        </div>
                        <span className="font-medium">
                          ${(item.subtotal?.amount ?? 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                    {(invoice.tax?.amount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span>
                          Tax {invoice.taxRate ? `(${(invoice.taxRate * 100).toFixed(1)}%)` : ''}
                        </span>
                        <span className="font-medium">
                          ${(invoice.tax?.amount ?? 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-semibold">
                    ${(invoice.total?.amount ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span className="text-destructive font-medium">
                      -${invoice.payments
                        .reduce((sum, payment) => sum + (payment.amount?.amount ?? 0), 0)
                        .toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Remaining Balance</span>
                  <span className="font-bold">
                    ${(invoice.balance?.amount ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {sendError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {sendError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSend}
              disabled={sending || invoice.status === 'SENT'}
              className="flex-1"
            >
              {sending
                ? 'Sending...'
                : invoice.status === 'SENT'
                  ? 'Sent'
                  : 'Send Invoice'}
            </Button>
            <Link to={`/invoices/${invoice.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

