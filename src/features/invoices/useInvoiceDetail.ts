import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export interface Money {
  amount: number;
  currency: string;
}

export interface Payment {
  id: string;
  amount: Money;
  paymentDate: string;
  method: string;
  reference?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
}

export interface InvoiceDetail {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  sentDate?: string;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
  taxRate?: number;
  notes?: string;
  subtotal: Money;
  tax: Money;
  total: Money;
  balance: Money;
}

export interface UseInvoiceDetailResult {
  invoice: InvoiceDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInvoiceDetail(invoiceId: string | undefined): UseInvoiceDetailResult {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) {
      setError('Invoice ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<InvoiceDetail>(`/api/invoices/${invoiceId}`);
      setInvoice(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoice';
      setError(errorMessage);
      console.error('Invoice detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    refetch: fetchInvoice,
  };
}

