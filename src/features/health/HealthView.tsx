import { useHealth } from './useHealth';
import { Button } from '@/components/ui/button';

export function HealthView() {
  const { health, loading, error, refetch } = useHealth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading health status...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-destructive">Error loading health status</div>
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
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="mt-2 text-muted-foreground">Backend health endpoint status</p>
        </div>
        <Button onClick={refetch} variant="outline">
          Refresh
        </Button>
      </div>

      {health && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Health Status Response</h2>
          <div className="rounded-md bg-muted p-4">
            <pre className="overflow-x-auto text-sm">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!health && !loading && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">No health data available</p>
        </div>
      )}
    </div>
  );
}

