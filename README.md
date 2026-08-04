# Dental Clinic EHR — Next.js + SQLite

Production-ready patient registration and admin dashboard for the dental clinic system.

## Features

- Public patient registration (Arabic/English, dark/light theme)
- Admin dashboard with search, filters, and KPI stats
- Patient view, edit, delete
- Follow-up scheduling and batch printing
- Interactive Palmer odontogram
- File attachments (X-rays, PDFs)
- Audit log with filtering
- JSON backup and restore
- Admin user management (super admin only)
- SQLite persistence with WAL mode
- Secure session auth with bcrypt password hashing

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and edit credentials
cp .env.example .env.local

# Initialize database
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for patient registration.

Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default credentials (change in `.env.local` before first migration):

- Username: `admin`
- Password: `ChangeMe123!`

## Production

```bash
npm run build
npm start
```

Set these environment variables in production:

| Variable | Description |
|----------|-------------|
| `SESSION_SECRET` | Random 32+ char string (`openssl rand -hex 32`) |
| `SUPER_ADMIN_USERNAME` | Initial super admin username |
| `SUPER_ADMIN_PASSWORD` | Initial super admin password |
| `DATABASE_PATH` | Path to SQLite file (default: `./data/clinic.db`) |

## Project Structure

```
app/                  Next.js App Router pages & API routes
components/           React UI components
lib/                  Database, auth, validation, i18n
public/images/        Static assets
data/                 SQLite database (created at runtime)
legacy/               Original static HTML/JS version
```

## API Routes

| Route | Methods | Auth |
|-------|---------|------|
| `/api/patients` | GET, POST | GET: admin, POST: public |
| `/api/patients/[id]` | GET, PUT, DELETE | PUT/DELETE: admin |
| `/api/follow-ups` | POST, DELETE | admin |
| `/api/attachments` | GET, POST, DELETE | admin |
| `/api/auth/login` | POST | public |
| `/api/auth/logout` | POST | public |
| `/api/backup` | GET, POST | admin |
| `/api/audit-logs` | GET, DELETE | admin |
| `/api/users` | GET, POST, DELETE | super admin |

## Migrating from Legacy

The original static app is preserved in `legacy/`. To import old localStorage data, export a JSON backup from the legacy dashboard and restore it via the admin dashboard backup restore button.
