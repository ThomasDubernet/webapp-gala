# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reservation Berth is a Symfony 5.3 application for managing event reservations and table seating. It handles guest registration, table assignments, ticket management, payment tracking, and attendance for events (galas). The application integrates with BilletWeb for ticket synchronization and OVH for SMS notifications.

## Common Commands

### Development Environment

```bash
# Start development environment
composer install
npm install
docker-compose up -d
symfony serve -d
npm run watch

# Or use npm run dev for one-time build
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
php bin/phpunit --testdox
```

### Frontend Build

```bash
npm run build    # Production build
npm run watch    # Development with hot reload
npm run dev      # One-time development build
```

### Linting

```bash
npx eslint assets/   # Lint JavaScript/React files
```

## Architecture

### Backend (Symfony)

- **API Platform**: REST API exposed via entity annotations (`src/Entity/`). Pagination disabled globally. Endpoints follow `/api/` prefix.
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
  - `Search.jsx`: Main guest search interface
  - `HotesseSearch.jsx`: Simplified search for hostesses
  - `Plan.jsx`: Visual table layout
  - `Tables/`: Table management components
- **Stimulus Controllers** (`assets/controllers/`): Lightweight JS behaviors
- **Styling**: SCSS with Bootstrap 5, Bootstrap Icons

### Domain Model

Core entities with API Platform annotations:
- `Personne`: Guest with contact info, payment status, table assignment, presence tracking
- `Table`: Seating table with position (posX/posY), capacity, category
- `Evenement`: Event configuration
- `Ticket`: Links person to event ticket
- `CategoriePersonne`/`CategorieTable`/`Civilite`: Reference data

### External Integrations

- **BilletWeb**: Ticket sales platform - sync via `BilletWebService`
- **OVH SMS API**: Guest notifications via `SmsService`
- **MailCatcher**: Local email testing (Docker)

## Key Configuration

- Database: MySQL 8.0 (Docker) - see `compose.yaml`
- API formats: JSON, JSON-LD (see `config/packages/api_platform.yaml`)
- File uploads: VichUploader bundle, uploads to `public/uploads/`
- Security: Form login authentication (see `config/packages/security.yaml`)
