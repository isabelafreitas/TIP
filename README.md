# TIP — Marketplace de Serviços Bilaterais

TIP is a bilateral services marketplace for Campinas, Brazil. Both consumers and providers can post announcements, negotiate services, and transact securely via escrow-style payments through Pagar.me.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm

### 1. Clone and configure
```bash
cp .env.example .env
# Edit .env with your real secrets before deploying
```

### 2. Start PostgreSQL
```bash
docker-compose up -d postgres
```

### 3. Install dependencies and run migrations
```bash
cd backend
npm install
npm run migrate
```

### 4. Start the backend
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Architecture

```
backend/
  index.js                  # Entry point
  src/
    config/
      database.js           # pg Pool setup
      jwt.js                # JWT sign/verify helpers
    middlewares/
      auth.js               # Bearer token middleware
      upload.js             # Multer + S3 upload helper
    db/
      schema.sql            # Full schema reference
      migrate.js            # Migration runner
      migrations/           # Numbered SQL migration files
    controllers/            # Route handlers
    services/               # Business logic
    routes/                 # Express routers
    jobs/                   # node-cron scheduled jobs
    websocket/
      chat.ws.js            # WebSocket real-time chat
```

## API Overview

| Resource | Base Path |
|---|---|
| Auth | `/api/auth` |
| Users / Profile | `/api/users` |
| Providers | `/api/providers` |
| Announcements | `/api/announcements` |
| Services | `/api/services` |
| Payments | `/api/payments` |
| Disputes | `/api/disputes` |
| Reviews | `/api/reviews` |
| Chat | `/api/chat` |
| Saved Providers | `/api/saved` |

## Payment Flow

1. Service is agreed → requester pays (credit/debit/pix via Pagar.me).
2. Payment is held in escrow.
3. Provider marks service complete → requester confirms (or disputes within 48h).
4. On confirmation or no dispute within 48h → payment auto-released to provider minus TIP fee (15% default).

## Environment Variables

See `.env.example` for all required variables.
