import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { truncateToTwoDecimals } from '@/lib/money';

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

export interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<Invoice[]>('/api/invoices');
      // Normalize amounts: API returns dollar amounts with decimals, truncate to 2 decimal places
      const normalizedInvoices = response.data.map((invoice) => ({
        ...invoice,
        total: truncateToTwoDecimals(invoice.total), // Truncate to 2 decimals (treat as dollars)
        balance: truncateToTwoDecimals(invoice.balance), // Truncate to 2 decimals (treat as dollars)
      }));
      setInvoices(normalizedInvoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(errorMessage);
      console.error('Invoices fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
  };
}

