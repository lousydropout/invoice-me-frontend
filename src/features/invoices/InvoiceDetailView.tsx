import { useParams, Link } from 'react-router-dom';
import { useInvoiceDetail } from './useInvoiceDetail';
import { useCustomerDetail } from '@/features/customers/useCustomerDetail';
import { Button } from '@/components/ui/button';

export function InvoiceDetailView() {
  const { id } = useParams<{ id: string }>();
  const { invoice, loading, error, refetch } = useInvoiceDetail(id);
  const { customer } = useCustomerDetail(invoice?.customerId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading invoice...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading invoice</div>
          <div className="mt-2 text-sm text-muted-foreground">{error}</div>
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={refetch} variant="outline">
              Retry
            </Button>
            <Link to="/invoices">
              <Button variant="secondary">Back to Invoices</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Invoice not found</div>
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
        <Link to="/invoices">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Invoices
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
          </div>
          <div className="flex gap-2">
            {invoice.status === 'SENT' ? (
              <Button variant="outline" disabled>
                Sent
              </Button>
            ) : (
              <Link to={`/invoices/${invoice.id}/send`}>
                <Button variant="outline">Send</Button>
              </Link>
            )}
            <Link to={`/invoices/${invoice.id}/payment`}>
              <Button variant="outline">Record Payment</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Details */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Invoice Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 ml-4">
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
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Customer Name</dt>
              <dd className="mt-1 ml-4">
                {invoice.customerName || customer?.name ? (
                  <Link
                    to={`/customers/${invoice.customerId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {invoice.customerName || customer?.name}
                  </Link>
                ) : (
                  <Link
                    to={`/customers/${invoice.customerId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {invoice.customerId}
                  </Link>
                )}
              </dd>
            </div>
            {invoice.customerEmail || customer?.email ? (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 ml-4 text-sm">
                  {invoice.customerEmail || customer?.email ? (
                    <a
                      href={`mailto:${invoice.customerEmail || customer?.email}`}
                      className="text-primary hover:underline"
                    >
                      {invoice.customerEmail || customer?.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </dd>
              </div>
            ) : null}
            {customer?.street || customer?.city || customer?.postalCode || customer?.country ? (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="mt-1 ml-4 text-sm">
                  <div className="space-y-1">
                    {customer.street && <div>{customer.street}</div>}
                    {(customer.city || customer.postalCode || customer.country) && (
                      <div>
                        {[customer.city, customer.postalCode, customer.country]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Customer ID</dt>
              <dd className="mt-1 ml-4 text-sm">
                <Link
                  to={`/customers/${invoice.customerId}`}
                  className="text-primary hover:underline"
                >
                  {invoice.customerId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Issue Date</dt>
              <dd className="mt-1 ml-4 text-sm">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Due Date</dt>
              <dd className="mt-1 ml-4 text-sm">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Financial Summary */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Summary</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Subtotal</dt>
              <dd className="text-sm">
                ${(invoice.subtotal?.amount ?? 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Tax {invoice.taxRate ? `(${(invoice.taxRate * 100).toFixed(1)}%)` : ''}
              </dt>
              <dd className="text-sm">
                ${(invoice.tax?.amount ?? 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt className="text-sm font-semibold">Total Amount</dt>
              <dd className="text-sm font-semibold">
                ${(invoice.total?.amount ?? 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Paid Amount</dt>
                <dd className="text-sm">
                  ${invoice.payments
                    .reduce((sum, payment) => sum + (payment.amount?.amount ?? 0), 0)
                    .toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </dd>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <dt className="text-base font-semibold">Outstanding Amount</dt>
                <dd className="text-base font-bold">
                  ${(invoice.balance?.amount ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Line Items */}
      {invoice.lineItems && invoice.lineItems.length > 0 && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={`line-item-${index}`} className="border-b">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      ${(item.unitPrice?.amount ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${(item.subtotal?.amount ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                {(invoice.tax?.amount ?? 0) > 0 && (
                  <tr className="border-b">
                    <td className="px-4 py-3">
                      Tax {invoice.taxRate ? `(${(invoice.taxRate * 100).toFixed(1)}%)` : ''}
                    </td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right">—</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${(invoice.tax?.amount ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 font-semibold">
                  <td className="px-4 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${(invoice.total?.amount ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}

