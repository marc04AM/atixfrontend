# AtixOps Frontend

React SPA for the AtixOps work management platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build and dev server
- **shadcn/ui** + Radix UI for components
- **TailwindCSS** for styling
- **React Query** (TanStack) for server state
- **React Router** for navigation
- **React Hook Form** + Zod for form validation
- **i18next** for internationalization (EN, IT)
- **Recharts** for data visualization
- **Sentry** for error tracking

## Getting Started

```bash
npm install
npm run dev       # Start dev server at http://localhost:8080
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── components/ui/    # shadcn/ui components
├── contexts/         # React Context providers (auth, theme, etc.)
├── hooks/api/        # API integration hooks (React Query)
├── pages/            # Page components
├── locales/          # i18n translations (en/, it/)
└── types/            # TypeScript type definitions
```

## Key Patterns

- **Server state**: React Query handles caching, refetching, and optimistic updates
- **Client state**: React Context for auth, theme, and UI state
- **Forms**: React Hook Form with Zod schema validation
- **i18n**: Automatic browser language detection, English and Italian supported
- **Auth**: JWT tokens stored client-side, role-based UI rendering

## API

Connects to the Spring Boot backend at `http://localhost:3001/api` in development.
