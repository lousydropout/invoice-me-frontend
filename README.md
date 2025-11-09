# InvoiceMe Frontend

A React-based frontend application for the InvoiceMe ERP system, providing a developer-facing interface for invoice management, customer management, and payment tracking.

## Overview

InvoiceMe is an ERP system focused on invoice management, customer management, and payment tracking. This frontend provides a simple, synchronous interface to visualize, test, and interact with the InvoiceMe backend API.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Local state only (`useState` + `useEffect`)
- **Architecture**: Vertical Slice Architecture (VSA)

## Project Structure

```
src/
├── api/
│   └── client.ts                 # Axios instance configuration
├── features/
│   ├── dashboard/                # Dashboard feature slice
│   ├── invoices/                 # Invoices feature slice
│   ├── customers/                # Customers feature slice
│   └── health/                   # Health check feature slice
├── components/
│   └── ui/                       # shadcn/ui components
├── lib/
│   └── utils.ts                  # Utility functions
├── App.tsx                       # Route definitions
└── main.tsx                      # Entry point
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

```bash
# Install dependencies
bun install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://invoice-me.vincentchan.cloud
```

### Development

```bash
# Start development server
bun run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build

```bash
# Build for production
bun run build
```

The production build will be output to the `dist/` directory.

### Preview Production Build

```bash
# Preview production build locally
bun run preview
```

### Linting

```bash
# Run ESLint
bun run lint
```

## Routes

| Route            | Component            | Purpose                               |
| ---------------- | -------------------- | ------------------------------------- |
| `/`              | `DashboardView`      | Entry point with KPI summary          |
| `/invoices`      | `InvoicesView`       | Lists all invoices                    |
| `/invoices/:id`  | `InvoiceDetailView`  | Displays one invoice                  |
| `/customers`     | `CustomersView`      | Lists all customers                   |
| `/customers/:id` | `CustomerDetailView` | Displays one customer                 |
| `/health`        | `HealthView`         | Backend health endpoint visualization |

## Architecture

### Vertical Slice Architecture (VSA)

The project follows a Vertical Slice Architecture pattern where each feature is self-contained:

- **Feature Directory**: Contains all files related to a feature
- **Custom Hooks** (`useX.ts`): Handle data fetching and state management
- **Views** (`XView.tsx`): Presentational components that consume hooks
- **No Global State**: Each feature manages its own state locally

### State Management Pattern

```typescript
// Example: useInvoices.ts
export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return { invoices, loading, error };
}

// Example: InvoicesView.tsx
export function InvoicesView() {
  const { invoices, loading, error } = useInvoices();
  // Render UI
}
```

## API Integration

The frontend communicates with the backend API at `https://invoice-me.vincentchan.cloud`. 

### Available Endpoints

- **Health**: `GET /api/health`
- **Invoices**: `GET /api/invoices`, `GET /api/invoices/{id}`, `POST /api/invoices`, etc.
- **Customers**: `GET /api/customers`, `GET /api/customers/{id}`, `POST /api/customers`, etc.

See the [API Reference](memory-bank/api-reference.md) for complete endpoint documentation.

### API Client

The API client is configured in `src/api/client.ts` using Axios. It automatically uses the `VITE_API_BASE_URL` environment variable.

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Path Alias**: `@/` maps to `src/` directory

## Development Guidelines

### Adding a New Feature

1. Create a feature directory in `src/features/`
2. Create a custom hook (`useX.ts`) for data fetching and state management
3. Create a view component (`XView.tsx`) that consumes the hook
4. Add the route in `App.tsx`
5. Add navigation link if needed

### Code Patterns

- Use custom hooks for data fetching (Model + ViewModel layer)
- Keep views as presentational components
- Handle loading and error states gracefully
- No external state management libraries (Redux, MobX, etc.)

## Deployment

The frontend is deployed to AWS ECS alongside the backend. See [deployment.md](memory-bank/deployment.md) for details.

## Related Documentation

- [Project Overview](memory-bank/project-overview.md)
- [Frontend PRD](memory-bank/frontend-prd.md)
- [API Reference](memory-bank/api-reference.md)
- [Development Notes](memory-bank/development-notes.md)
- [Deployment Guide](memory-bank/deployment.md)

