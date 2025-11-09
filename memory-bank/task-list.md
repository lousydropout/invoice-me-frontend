# 🧰 **InvoiceMe Frontend Task List**

### Setup & Environment

1. [x] Initialize project:

   ```bash

   bun create vite invoiceme-frontend --template react-ts

   cd invoiceme-frontend

   bun add react-router-dom axios

   ```

2. [x] Create `.env` with

   ```

   VITE_API_BASE_URL=https://invoice-me.vincentchan.cloud

   ```

3. [x] Configure `src/api/client.ts` with Axios base URL.

---

### Core Features

#### Dashboard

4. [x] Implement `useDashboard.ts`

   * Fetch `/api/invoices/overdue`, `/api/customers/outstanding`, `/api/health`

5. [x] Create `DashboardView.tsx` to display KPIs and navigation links.

#### Invoices

6. [x] Implement `useInvoices.ts` and `InvoicesView.tsx`

   * Fetch `/api/invoices`

   * Add "Create Invoice" button (placeholder)

7. [x] Add `useInvoiceDetail.ts` and `InvoiceDetailView.tsx`

   * Fetch `/api/invoices/{id}`

   * Show line items and totals

   * Add "Send" and "Record Payment" stub buttons.

#### Customers

8. [x] Implement `useCustomers.ts` and `CustomersView.tsx`

   * Fetch `/api/customers`

9. [x] Add `useCustomerDetail.ts` and `CustomerDetailView.tsx`

   * Fetch `/api/customers/{id}`

   * Display address, email, phone.

#### Health

10. [x] Implement `useHealth.ts` and `HealthView.tsx`

    * Fetch `/api/health`

    * Show result in JSON format.

---

### Routing & Layout

11. [ ] Configure `App.tsx` with all routes.

12. [ ] Verify navigation between pages using `Link` components.

13. [ ] Add a simple navbar or breadcrumbs.

---

### Testing

14. [ ] Install Jest + RTL via Bun:

    ```bash

    bun add -d jest @testing-library/react @testing-library/jest-dom

    ```

15. [ ] Write one smoke test per View (render + mock Axios).

---

### Deployment

16. [ ] Build static bundle: `bun run build`

17. [ ] Deploy to ECS task as frontend container alongside backend.

---

