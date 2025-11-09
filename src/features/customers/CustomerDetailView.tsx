import { useParams, Link } from 'react-router-dom';
import { useCustomerDetail } from './useCustomerDetail';
import { useInvoices } from '@/features/invoices/useInvoices';
import { Button } from '@/components/ui/button';

export function CustomerDetailView() {
  const { id } = useParams<{ id: string }>();
  const { customer, loading, error, refetch } = useCustomerDetail(id);
  const { invoices, loading: invoicesLoading } = useInvoices();

  // Filter invoices for this customer
  const customerInvoices = invoices.filter((invoice) => invoice.customerId === id);
  
  // Calculate total outstanding balance from invoices
  const totalOutstandingBalance = customerInvoices.reduce(
    (sum, invoice) => sum + (invoice.balance ?? 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading customer...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading customer</div>
          <div className="mt-2 text-sm text-muted-foreground">{error}</div>
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={refetch} variant="outline">
              Retry
            </Button>
            <Link to="/customers">
              <Button variant="secondary">Back to Customers</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Customer not found</div>
          <Link to="/customers" className="mt-4 block">
            <Button variant="secondary">Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to="/customers">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Customers
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="mt-2 text-muted-foreground">Customer #{customer.id}</p>
          </div>
          <Link to={`/customers/${customer.id}/edit`}>
            <Button>Edit Customer</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm">
                {customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-primary hover:underline"
                  >
                    {customer.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm">
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-primary hover:underline"
                  >
                    {customer.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Address</dt>
              <dd className="mt-1 text-sm">
                {customer.street || customer.city || customer.postalCode || customer.country ? (
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
                ) : (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </dd>
            </div>
            {customer.paymentTerms && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Payment Terms</dt>
                <dd className="mt-1 text-sm">{customer.paymentTerms}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Financial Summary */}
        {customer.outstandingBalance !== undefined && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Financial Summary</h2>
            <dl className="space-y-3">
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <dt className="text-base font-semibold">Outstanding Balance</dt>
                  <dd className="text-base font-bold">
                    ${(customer.outstandingBalance ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {invoicesLoading
              ? 'Loading...'
              : `${customerInvoices.length} ${customerInvoices.length === 1 ? 'invoice' : 'invoices'}`}
          </p>
        </div>

        {invoicesLoading ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        ) : customerInvoices.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">No invoices found for this customer</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                      Outstanding
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${(invoice.total ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        ${(invoice.balance ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {customerInvoices.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 bg-muted/50">
                      <td className="px-6 py-4 font-semibold" colSpan={5}>
                        Total Outstanding Balance
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        ${totalOutstandingBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

