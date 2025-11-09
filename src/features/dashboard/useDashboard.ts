import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { truncateToTwoDecimals } from '@/lib/money';

export interface Money {
  amount: number;
  currency: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  total: number;
  balance: number;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  outstandingBalance: number;
}

export interface HealthStatus {
  status: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface DashboardData {
  overdueInvoices: Invoice[];
  allInvoices: Invoice[];
  allCustomers: Customer[];
  outstandingCustomers: Customer[];
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(): DashboardData {
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [outstandingCustomers, setOutstandingCustomers] = useState<Customer[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all endpoints in parallel
        const [overdueResponse, allInvoicesResponse, allCustomersResponse, outstandingCustomersResponse, healthResponse] = await Promise.all([
          apiClient.get<Invoice[]>('/api/invoices/overdue'),
          apiClient.get<Invoice[]>('/api/invoices'),
          apiClient.get<Customer[]>('/api/customers'),
          apiClient.get<Customer[]>('/api/customers/outstanding'),
          apiClient.get<HealthStatus>('/api/health'),
        ]);

        // Create a map of outstanding balances by customer ID
        // Ignore balances less than 0.01 (trivial amounts)
        const outstandingBalanceMap = new Map<number, number>();
        outstandingCustomersResponse.data.forEach((customer) => {
          let balance: number;
          if (customer.outstandingBalance !== undefined && customer.outstandingBalance !== null) {
            if (typeof customer.outstandingBalance === 'object' && 'amount' in customer.outstandingBalance) {
              balance = (customer.outstandingBalance as Money).amount;
            } else {
              balance = customer.outstandingBalance as number;
            }
            // Truncate to 2 decimal places, only include if >= 0.01
            const truncatedBalance = truncateToTwoDecimals(balance);
            if (truncatedBalance >= 0.01) {
              outstandingBalanceMap.set(customer.id, truncatedBalance);
            }
          }
        });

        // Merge: set outstanding balance from map, or 0 if not found
        const mergedCustomers = allCustomersResponse.data.map((customer) => ({
          ...customer,
          outstandingBalance: outstandingBalanceMap.get(customer.id) ?? 0,
        }));

        // Normalize amounts: API returns dollar amounts with decimals, truncate to 2 decimal places
        // Store as dollars (will be converted to pennies for display if needed)
        const normalizedOverdue = overdueResponse.data.map((invoice) => ({
          ...invoice,
          total: truncateToTwoDecimals(invoice.total), // Truncate to 2 decimals (treat as dollars)
          balance: truncateToTwoDecimals(invoice.balance), // Truncate to 2 decimals (treat as dollars)
        }));
        const normalizedAllInvoices = allInvoicesResponse.data.map((invoice) => ({
          ...invoice,
          total: truncateToTwoDecimals(invoice.total), // Truncate to 2 decimals (treat as dollars)
          balance: truncateToTwoDecimals(invoice.balance), // Truncate to 2 decimals (treat as dollars)
        }));
        
        // Filter outstanding customers to only include those with balance >= 0.01 (after truncation)
        const filteredOutstandingCustomers = outstandingCustomersResponse.data.filter((customer) => {
          let balance: number;
          if (customer.outstandingBalance !== undefined && customer.outstandingBalance !== null) {
            if (typeof customer.outstandingBalance === 'object' && 'amount' in customer.outstandingBalance) {
              balance = (customer.outstandingBalance as Money).amount;
            } else {
              balance = customer.outstandingBalance as number;
            }
            const truncatedBalance = truncateToTwoDecimals(balance);
            return truncatedBalance >= 0.01;
          }
          return false;
        });

        setOverdueInvoices(normalizedOverdue);
        setAllInvoices(normalizedAllInvoices);
        setAllCustomers(mergedCustomers);
        setOutstandingCustomers(filteredOutstandingCustomers);
        setHealth(healthResponse.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    overdueInvoices,
    allInvoices,
    allCustomers,
    outstandingCustomers,
    health,
    loading,
    error,
  };
}

