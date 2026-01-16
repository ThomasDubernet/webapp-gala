# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reservation Beth Rivkah is a Symfony 6.4 application for managing event reservations and table seating. It handles guest registration, table assignments, ticket management, payment tracking, and attendance for events (galas). The application integrates with BilletWeb for ticket synchronization and OVH for SMS notifications.

## Common Commands

### Development Environment

```bash
# Start development environment
composer install
npm install
docker-compose up -d
symfony serve -d
npm run watch
```

### Database Operations

```bash
# Reset database with fixtures (drops DB, creates schema, loads fixtures)
composer run prepare

# Generate new migration after entity changes
composer run upmigration

# Run migrations
symfony console doctrine:migrations:migrate
```

### Tests

```bash
# Run all tests
php bin/phpunit --testdox

# Run a single test file
php bin/phpunit tests/Path/To/TestFile.php

# Run a specific test method
php bin/phpunit --filter testMethodName
```

### Frontend Build

```bash
npm run build    # Production build
npm run watch    # Development with hot reload
npm run dev      # One-time development build
```

### Frontend Build Rules (IMPORTANT)

**NEVER run `npm run build` when `npm run watch` is running in background** - it will kill the watch process and cause a blank page.

Follow this workflow:
1. **Check if watch is running**: Look for background tasks or check `/tasks` output
2. **If watch is NOT running**: Start it with `npm run watch` in background
3. **To verify build succeeds**: Read the watch task output file (`tail` the output) instead of running `npm run build`
4. **TypeScript check**: Use `npx tsc --noEmit` - this doesn't interfere with watch

### Linting

```bash
npx eslint assets/   # Lint JavaScript/React files
```

## Architecture

### Backend (Symfony)

- **API Platform 3.x**: REST API exposed via entity attributes (`src/Entity/`). Pagination disabled globally. Endpoints follow `/api/` prefix.
- **Controllers**: Mix of traditional Symfony controllers and API Platform custom operations
  - `BilletWebController`: Syncs tickets from BilletWeb external service
  - `PersonneController`: CRUD operations for guests with search, category filtering
  - `SmsController`: SMS notifications via OVH API
  - `PdfController`/`ExportController`: Generate PDFs (mPDF) and Excel exports (PhpSpreadsheet)
- **Services**: `BilletWebService` (API integration), `SmsService` (OVH SMS), `UtilsService` (text formatting)
- **Normalizers**: Custom API Platform serialization in `src/Normalizer/`

### Frontend (React + Stimulus)

- **Webpack Encore**: Compiles assets from `assets/` to `public/build/`
- **React Components** (`assets/components/`):
  - `Search.tsx`: Main guest search interface with server-side search
  - `HotesseSearch.tsx`: Simplified search for hostesses
  - `Tables/`: Table management components (Table, TableToolbar, provider)
  - `PersonCard.tsx`: Guest card component using Tailwind + Shadcn UI patterns
- **Pages** (`assets/pages/`):
  - `Dashboard.tsx`: Visual table layout (plan view)
- **Stimulus Controllers** (`assets/controllers/`): Lightweight JS behaviors
- **Styling**:
  - Tailwind CSS v4 (primary styling framework)
  - Shadcn UI patterns (class-variance-authority, tailwind-merge, clsx)
  - Lucide React icons

### Domain Model

Core entities with API Platform attributes:
- `Personne`: Guest with contact info, payment status, table assignment, presence tracking. Has database indexes on `nom`, `prenom`, `email` for search performance.
- `Table`: Seating table with position (posX/posY), capacity, category
- `Evenement`: Event configuration
- `Ticket`: Links person to event ticket
- `CategoriePersonne`/`CategorieTable`/`Civilite`: Reference data

### External Integrations

- **BilletWeb**: Ticket sales platform - sync via `BilletWebService`
- **OVH SMS API**: Guest notifications via `SmsService`
- **MailCatcher**: Local email testing (Docker)

## Key Configuration

- PHP: ≥8.2
- Database: MySQL 8.0 (Docker) - see `compose.yaml`
- API formats: JSON, JSON-LD (see `config/packages/api_platform.yaml`)
- File uploads: VichUploader bundle, uploads to `public/uploads/`
- Security: Form login authentication (see `config/packages/security.yaml`)

## Styling Guidelines

Tailwind CSS v4 is the primary styling framework. Use Shadcn UI patterns (class-variance-authority, tailwind-merge, clsx) for component variants. Lucide React is used for icons.

## Component Creation Rules (MANDATORY)

### Always Prioritize Shadcn/ui

**Before creating ANY UI component, you MUST:**

1. **Check if the component exists on Shadcn/ui** via Context7 MCP:
   ```
   mcp__context7__resolve-library-id with libraryName: "shadcn-ui"
   mcp__context7__query-docs with the component name (e.g., "button", "dialog", "calendar", "date-picker")
   ```

2. **If the component exists on Shadcn/ui:**
   - Get the installation command from the docs (e.g., `npx shadcn@latest add button`)
   - Install the component using the command
   - Modify it if needed for the specific feature requirements
   - Components are installed in `assets/components/ui/`

3. **If the component does NOT exist on Shadcn/ui:**
   - Check if a Radix UI primitive exists that could be used
   - Only then create a custom component following Shadcn patterns (cva, cn, etc.)

### Detect and Propose Refactoring

**When reviewing or working on existing code:**

If you encounter hand-made UI code that could have used Shadcn/ui or Radix UI primitives, you MUST use `AskUserQuestion` to propose refactoring:

- Custom modal/dialog implementations → Shadcn Dialog
- Custom dropdown menus → Shadcn DropdownMenu
- Custom select inputs → Shadcn Select
- Custom date pickers → Shadcn Calendar/DatePicker
- Custom tabs → Shadcn Tabs
- Custom tooltips → Shadcn Tooltip
- Custom popovers → Shadcn Popover
- Custom accordions → Shadcn Accordion
- Any custom component that reinvents a standard UI pattern

Example question to ask:
```
"I noticed this [component type] was implemented manually. Shadcn/ui provides a [component name] component that would offer better accessibility, consistency, and maintainability. Would you like me to replace it with the Shadcn version?"
```

### Component Location

- Shadcn components: `assets/components/ui/`
- Custom app components: `assets/components/`
- Pages: `assets/pages/`
