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
      setInvoices(response.data);
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

