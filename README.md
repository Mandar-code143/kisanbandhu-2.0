# Krushi Rojgar Sandhi (कृषी रोजगार संधी)

> **Indian Agriculture Employment Platform** — Connecting farmers with agricultural workers through a digital marketplace with IVR, multilingual support, and seamless payment processing.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.19-green.svg)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-purple.svg)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Express    │────▶│  PostgreSQL  │
│   Frontend   │     │   Backend    │     │   Database   │
│  :3000       │     │  :5000       │     │  :5432       │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                    ┌───────┴────────┐
                    │   External     │
                    │   Services     │
                    ├────────────────┤
                    │ • Razorpay     │
                    │ • Twilio (IVR) │
                    │ • SMTP (Email) │
                    └────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, TanStack Query, React Hook Form |
| **Backend** | Node.js 20, Express 4, TypeScript, Prisma ORM, Zod validation |
| **Database** | PostgreSQL 16 |
| **Payments** | Razorpay (UPI, Cards, Net Banking, Wallet) |
| **Communication** | Twilio (IVR, SMS), Nodemailer (Email) |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Infrastructure** | Docker, Docker Compose, Nginx |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) |

## Features

### For Workers (मजूर)
- **Job Discovery** — Browse daily-wage, contract & seasonal agricultural jobs near you
- **Apply & Track** — One-tap apply with real-time application status
- **Wallet & Payments** — Receive wages directly to your in-app wallet or bank
- **Multilingual IVR** — Call our IVR system to search jobs, apply, and check balance without internet
- **Profile Management** — Skills, experience, documents & availability
- **Attendance Marking** — Daily check-in/check-out with geo-tagging

### For Farmers (शेतकरी)
- **Job Posting** — Create jobs in minutes with flexible durations (daily/contract/seasonal)
- **Worker Discovery** — Find nearby workers filtered by skill, rating & availability
- **Payment Management** — Pay workers, track expenses, generate receipts
- **Dashboard** — Analytics on workforce, costs & productivity
- **Contract Management** — Create, sign & manage work contracts

### For Contractors (कंत्राटदार)
- **Team Management** — Build & manage your crew of workers
- **Bulk Hiring** — Hire multiple workers for large-scale operations
- **Project Tracking** — Manage multiple agricultural projects

### Platform Features
- **IVR Integration** — Voice-based job search & application in Hindi/Marathi
- **Razorpay Payments** — Secure, instant payments with full reconciliation
- **Email & SMS Notifications** — Job alerts, payment confirmations & reminders
- **Role-Based Access** — Farmer, Worker, Contractor & Admin portals
- **Geo-Location** — Find jobs/workers near your village or district
- **Ratings & Reviews** — Trust-based worker & employer reputation system
- **Escrow Payments** — Secure fund holding until job completion

## Getting Started

### Prerequisites

- **Node.js** 20.x (see `.nvmrc`)
- **npm** 10+
- **PostgreSQL** 16 (local or Docker)
- **Docker** (optional, for containerized setup)

### Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/krushi-rojgar-sandhi.git
cd krushi-rojgar-sandhi

# 2. Use correct Node version
nvm use 20

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and API keys

# 5. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# 6. Start development servers
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Docker Setup

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Environment Variables

Key variables (full list in `.env.example`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret (32+ chars) |
| `RAZORPAY_KEY_ID` | Razorpay public API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `TWILIO_ACCOUNT_SID` | Twilio account for IVR/SMS |
| `SMTP_HOST` | Email SMTP server |

## Project Structure

```
├── apps/
│   └── web/                 # Next.js 15 Frontend
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # Reusable components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Utilities & config
│       │   ├── store/       # Zustand stores
│       │   └── types/       # TypeScript types
│       └── public/          # Static assets
├── backend/                 # Express API Server
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Auth, validation, error handling
│       ├── routes/          # API route definitions
│       ├── services/        # Business logic
│       ├── validators/      # Zod schemas
│       └── utils/           # Helpers & logger
├── prisma/                  # Database schema & migrations
├── docker/                  # Docker config files
├── docs/                    # Documentation
└── docker-compose.yml       # Container orchestration
```

## API Overview

The backend exposes a RESTful API at `/api`. Key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register user (Farmer/Worker/Contractor) |
| `/api/auth/login` | POST | Login & receive JWT tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/jobs` | GET | List jobs (filtered, paginated) |
| `/api/jobs` | POST | Create job (Farmer/Contractor) |
| `/api/jobs/:id/apply` | POST | Apply to job (Worker) |
| `/api/payments/create-order` | POST | Create Razorpay order |
| `/api/payments/verify` | POST | Verify payment signature |
| `/api/wallet` | GET | Get wallet balance & history |
| `/api/users/profile` | GET/PUT | Get/update user profile |
| `/api/ivr/call` | POST | Initiate IVR call |
| `/api/admin/*` | GET/POST | Admin dashboard & management |

Full API documentation available at `docs/API.md`.

## Deployment

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` → Backend URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` → Razorpay public key

### Backend (Render)

Use `render.yaml` for infrastructure-as-code deployment, or manually:

```bash
# Build
npm ci && npx prisma generate && npm run build --workspace=backend

# Start
npx prisma migrate deploy && node backend/dist/server.js
```

### Docker (Any Cloud)

```bash
docker compose -f docker-compose.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and type checks:
```bash
npm run lint
npm run build
```

## License

This project is proprietary software. All rights reserved.

---

Built with ❤️ for Indian Agriculture
