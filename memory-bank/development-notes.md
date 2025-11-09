# Development Notes

## Git Submodules

- `invoice-me-frontend` is a git submodule
- Changes in the submodule don't trigger main repo GitHub Actions (configured in `.github/workflows/build.yml`)

## Backend Development

### Running Locally
- Use Gradle: `./gradlew bootRun`
- Database: Configured via `application-dev.yml`
- Port: Default Spring Boot port (usually 8080)

### Testing
- Test command: `./gradlew test`
- Coverage: JaCoCo reports in `build/reports/jacoco/`

## Frontend Development

### Running Locally
- Dev server: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`

### Dependencies
- Install: `bun add <package>`
- Dev dependencies: `bun add -d <package>`

### Styling
- Use Tailwind CSS utility classes
- Use shadcn/ui components from `src/components/ui/`
- Path alias: `@/` maps to `src/`

## Code Patterns

### Frontend State Management
- Each feature has a custom hook (`useX.ts`) for data fetching
- Views (`XView.tsx`) consume hooks and render UI
- No global state management - local state only

### Backend Architecture
- Hexagonal Architecture (Ports & Adapters)
- Domain-driven design
- Separate layers: api, application, domain, infrastructure

## Common Tasks

### Adding New Frontend Feature
1. Create feature directory in `src/features/`
2. Create `useX.ts` hook for data fetching
3. Create `XView.tsx` component
4. Add route in `App.tsx`
5. Add navigation link if needed

### Updating API Client
- Modify `src/api/client.ts` in frontend
- Ensure base URL uses `import.meta.env.VITE_API_BASE_URL`

## Troubleshooting

### Submodule Issues
- If submodule appears empty: `git submodule update --init --recursive`
- To update submodule: `cd invoice-me-frontend && git pull`

### Build Issues
- Clear build cache: `./gradlew clean` (backend) or `rm -rf node_modules/.vite` (frontend)
- Reinstall dependencies: `bun install` (frontend)

