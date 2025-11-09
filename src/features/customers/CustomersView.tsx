import { Link } from 'react-router-dom';
import { useCustomers } from './useCustomers';
import { Button } from '@/components/ui/button';

export function CustomersView() {
  const { customers, loading, error, refetch } = useCustomers();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading customers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading customers</div>
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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="mt-2 text-muted-foreground">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'} found
          </p>
        </div>
        <Link to="/customers/create">
          <Button>Create Customer</Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No customers found</p>
          <Link to="/customers/create">
            <Button className="mt-4">Create Your First Customer</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                    Outstanding Balance
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/customers/${customer.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      ${customer.outstandingBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/customers/${customer.id}`}>
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

