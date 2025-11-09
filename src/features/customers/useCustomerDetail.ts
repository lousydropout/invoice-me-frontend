import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export interface CustomerDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  outstandingBalance?: number;
}

export interface UseCustomerDetailResult {
  customer: CustomerDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCustomerDetail(customerId: string | undefined): UseCustomerDetailResult {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) {
      setError('Customer ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<CustomerDetail>(`/api/customers/${customerId}`);
      setCustomer(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer';
      setError(errorMessage);
      console.error('Customer detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer,
  };
}

