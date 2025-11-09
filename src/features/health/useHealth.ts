import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export interface HealthStatus {
  status: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface UseHealthResult {
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHealth(): UseHealthResult {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<HealthStatus>('/api/health');
      setHealth(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health status';
      setError(errorMessage);
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refetch: fetchHealth,
  };
}

