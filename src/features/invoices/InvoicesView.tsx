import { Link } from 'react-router-dom';
import { useInvoices } from './useInvoices';
import { Button } from '@/components/ui/button';

export function InvoicesView() {
  const { invoices, loading, error, refetch } = useInvoices();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading invoices...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading invoices</div>
          <div className="mt-2 text-sm text-muted-foreground">{error}</div>
          <Button onClick={refetch} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="mt-2 text-muted-foreground">
            {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} found
          </p>
        </div>
        <Link to="/invoices/create">
          <Button>Create Invoice</Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No invoices found</p>
          <Link to="/invoices/create">
            <Button className="mt-4">Create Your First Invoice</Button>
          </Link>
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
                    Customer ID
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{invoice.customerId}</td>
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
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

