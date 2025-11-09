import { Link } from 'react-router-dom';
import { useDashboard, type Invoice, type Customer } from './useDashboard';
import { Button } from '@/components/ui/button';
import { formatDollarsTruncated } from '@/lib/money';

export function DashboardView() {
  const { overdueInvoices, allInvoices, allCustomers, health, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading dashboard</div>
          <div className="mt-2 text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  const overdueCount = overdueInvoices.length;
  const totalOverdue = overdueInvoices.reduce(
    (sum: number, invoice) => sum + (invoice.balance ?? 0),
    0
  );

  // Invoice summary calculations
  const totalInvoices = allInvoices.length;
  const invoicesWithOutstanding = allInvoices.filter((invoice: Invoice) => (invoice.balance ?? 0) > 0);
  const invoicesWithOutstandingCount = invoicesWithOutstanding.length;
  const totalOutstandingBalance = allInvoices.reduce(
    (sum: number, invoice: Invoice) => sum + (invoice.balance ?? 0),
    0
  );

  // Customer summary calculations
  const totalCustomers = allCustomers.length;
  const customersWithOutstanding = allCustomers.filter((customer: Customer) => (customer.outstandingBalance ?? 0) > 0);
  const customersWithOutstandingCount = customersWithOutstanding.length;
  // Get unique customer IDs from overdue invoices
  const customersWithOverdue = new Set(overdueInvoices.map((invoice) => invoice.customerId));
  const customersWithOverdueCount = customersWithOverdue.size;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your invoice management system</p>
      </div>

      {/* Health Status */}
      <div className="mb-6 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">System Health</h2>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{health?.status || 'Unknown'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-6">
          <div className="text-lg font-semibold">Customers Summary</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Customers</span>
              <span className="font-semibold">{totalCustomers}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground">With Outstanding Balance</span>
              <span className="font-semibold">{customersWithOutstandingCount}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground">With Overdue Balances</span>
              <span className="font-semibold">{customersWithOverdueCount}</span>
            </div>
          </div>
          <Link to="/customers" className="mt-4 block">
            <Button variant="outline" size="sm" className="w-full">
              View Customers
            </Button>
          </Link>
        </div>


        <div className="rounded-lg border bg-card p-6">
          <div className="text-lg font-semibold">Invoices Summary</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Invoices</span>
              <span className="font-semibold">{totalInvoices}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground">With Outstanding Balance</span>
              <span className="font-semibold">{invoicesWithOutstandingCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Outstanding</span>
              <span className="font-semibold">
                ${formatDollarsTruncated(totalOutstandingBalance)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overdue</span>
                <span className="font-semibold">{overdueCount}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Total Overdue</span>
                <span className="font-semibold">
                  ${formatDollarsTruncated(totalOverdue)}
                </span>
              </div>
            </div>
          </div>
          <Link to="/invoices" className="mt-4 block">
            <Button variant="outline" size="sm" className="w-full">
              View Invoices
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

