# Deployment Configuration

## Backend Deployment

### Build & Push
- **Dockerfile**: `backend/Dockerfile`
- **Registry**: Amazon ECR (`vincent-chan/invoice-me`)
- **Region**: `us-east-1`
- **Account ID**: `971422717446`

### ECS Configuration
- **Cluster**: `invoiceme-cluster`
- **Service**: Deployed via ECS task definitions
- **CI/CD**: GitHub Actions workflow (`.github/workflows/build.yml`)

### GitHub Actions
- **Trigger**: Push to `main` branch
- **Exclusions**: Changes in `invoice-me-frontend/**` are ignored
- **Steps**:
  1. Checkout repository
  2. Configure AWS credentials
  3. Login to ECR
  4. Build and push Docker image
  5. Force ECS service updates

## Frontend Deployment

### Build
- **Command**: `bun run build`
- **Output**: Static files in `dist/`
- **Deployment**: AWS ECS (frontend container alongside backend)

### Environment Variables
- `VITE_API_BASE_URL` - Backend API base URL

## Infrastructure

- **IaC**: AWS CDK (TypeScript)
- **Location**: `infra/cdk/`
- **Stack**: `InvoiceMeStack`

## Database

- **Type**: PostgreSQL
- **Schema**: Defined in `backend/src/main/resources/schema.sql`
- **Connection**: Configured via Spring Boot application properties

