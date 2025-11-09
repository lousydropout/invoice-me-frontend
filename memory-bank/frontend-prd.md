# InvoiceMe Frontend PRD

## Purpose

Provide a simple, synchronous, developer-facing frontend to visualize, test, and interact with the InvoiceMe ERP backend.

## Technical Stack

- **Framework**: React (Vite)
- **Language**: TypeScript
- **Package Manager**: Bun
- **Routing**: React Router
- **HTTP Client**: Axios
- **State**: `useState` + `useEffect` (local state only)
- **Styling**: Tailwind CSS + shadcn/ui
- **Architecture**: Vertical Slice Architecture (VSA)
- **Deployment**: AWS ECS
- **Environment**: `.env` with `VITE_API_BASE_URL=https://invoice-me.vincentchan.cloud`

## Directory Structure (VSA)

```
src/
├── api/
│   └── client.ts                 # axios instance
├── features/
│   ├── dashboard/
│   │   ├── DashboardView.tsx
│   │   └── useDashboard.ts
│   ├── invoices/
│   │   ├── InvoicesView.tsx
│   │   ├── InvoiceDetailView.tsx
│   │   ├── useInvoices.ts
│   │   └── useInvoiceDetail.ts
│   ├── customers/
│   │   ├── CustomersView.tsx
│   │   ├── CustomerDetailView.tsx
│   │   ├── useCustomers.ts
│   │   └── useCustomerDetail.ts
│   └── health/
│       ├── HealthView.tsx
│       └── useHealth.ts
├── components/
│   └── Table.tsx                 # shared dumb component
├── App.tsx                       # route definitions
└── main.tsx                      # entry point
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

## State Management Pattern

Each feature encapsulates its data and logic inside a custom hook (`useX.ts`) that acts as the Model + ViewModel layer. Views (`XView.tsx`) consume these hooks and render the UI.

## Key Constraints

- No state management libraries (Redux, MobX, etc.)
- Synchronous, developer-focused (not optimized for end users)
- Clear separation between hooks and views
- Handle loading/error states gracefully
- All OpenAPI endpoints accessible via UI

