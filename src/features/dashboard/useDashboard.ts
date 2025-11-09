import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';

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

        setOverdueInvoices(overdueResponse.data);
        setAllInvoices(allInvoicesResponse.data);
        setAllCustomers(allCustomersResponse.data);
        setOutstandingCustomers(outstandingCustomersResponse.data);
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

