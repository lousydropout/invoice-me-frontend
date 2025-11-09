# InvoiceMe Project Overview

## Project Description

InvoiceMe is an ERP (Enterprise Resource Planning) system focused on invoice management, customer management, and payment tracking.

## Architecture

### Backend
- **Language**: Java (Spring Boot)
- **Architecture**: Hexagonal Architecture (Ports & Adapters)
- **Database**: PostgreSQL
- **Deployment**: AWS ECS (Elastic Container Service)
- **API**: RESTful API with OpenAPI/Swagger documentation
- **Base URL**: `https://invoice-me.vincentchan.cloud`

### Frontend
- **Framework**: React + TypeScript (Vite)
- **Package Manager**: Bun
- **Styling**: Tailwind CSS + shadcn/ui
- **Architecture**: Vertical Slice Architecture (VSA)
- **State Management**: `useState` + `useEffect` (no external state libraries)
- **HTTP Client**: Axios
- **Routing**: React Router
- **Deployment**: AWS ECS (behind backend load balancer)

### Infrastructure
- **Infrastructure as Code**: AWS CDK (TypeScript)
- **Container Registry**: Amazon ECR
- **Orchestration**: AWS ECS

## Project Structure

```
invoice-me/
├── backend/              # Java Spring Boot backend
├── invoice-me-frontend/  # React frontend (git submodule)
├── infra/               # AWS CDK infrastructure code
├── scripts/             # Utility scripts
└── memory-bank/         # Project knowledge base
```

## Key Features

1. **Invoice Management** - Create, view, edit, send invoices
2. **Customer Management** - CRUD operations for customers
3. **Payment Tracking** - Record and track payments
4. **Health Monitoring** - System health endpoints

## Development Workflow

- Backend: Gradle-based Java project
- Frontend: Bun-based React project
- Infrastructure: CDK TypeScript project
- CI/CD: GitHub Actions (builds and deploys to ECS)

