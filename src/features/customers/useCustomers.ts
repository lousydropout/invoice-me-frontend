import { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { truncateToTwoDecimals } from '@/lib/money';

export interface Money {
  amount: number;
  currency: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  outstandingBalance: number;
}

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both endpoints in parallel
      const [customersResponse, outstandingResponse] = await Promise.all([
        apiClient.get<Customer[]>('/api/customers'),
        apiClient.get<Customer[]>('/api/customers/outstanding'),
      ]);

      // Create a map of outstanding balances by customer ID
      // Ignore balances less than 0.01 (trivial amounts)
      const outstandingBalanceMap = new Map<number, number>();
      outstandingResponse.data.forEach((customer) => {
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
      const mergedCustomers = customersResponse.data.map((customer) => ({
        ...customer,
        outstandingBalance: outstandingBalanceMap.get(customer.id) ?? 0,
      }));

      setCustomers(mergedCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Customers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
  };
}

