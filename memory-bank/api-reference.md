# API Reference

## Base URL

`https://invoice-me.vincentchan.cloud`

## OpenAPI Documentation

- **Swagger UI**: https://invoice-me.vincentchan.cloud/swagger-ui/index.html
- **OpenAPI Spec**: Available at `/openapi.json` or in `backend/openapi.json`

## Key Endpoints

### Health
- `GET /api/health` - System health check

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/{id}` - Get invoice by ID
- `GET /api/invoices/overdue` - Get overdue invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}` - Update invoice
- `POST /api/invoices/{id}/send` - Send invoice
- `POST /api/invoices/{id}/payments` - Record payment

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `GET /api/customers/outstanding` - Get customers with outstanding balances
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

## Authentication

Currently no authentication required (development/testing phase).

## Response Formats

All endpoints return JSON. Error responses follow standard HTTP status codes.

