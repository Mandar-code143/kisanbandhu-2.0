# Krushi Rojgar Sandhi — Architecture Documentation

## System Architecture

```
═══════════════════════════════════════════════════════════════════════════
                            CLIENT LAYER
═══════════════════════════════════════════════════════════════════════════

     ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
     │    Web Browser   │    │   Mobile Browser │    │    Phone Call   │
     │  (Next.js SPA)   │    │ (Responsive PWA) │    │  (Twilio IVR)   │
     └────────┬─────────┘    └────────┬─────────┘    └────────┬────────┘
              │                       │                       │
              │    HTTPS / REST       │                       │  PSTN
              ▼                       ▼                       ▼
═══════════════════════════════════════════════════════════════════════════
                          API GATEWAY / REVERSE PROXY
═══════════════════════════════════════════════════════════════════════════
                         ┌───────────────────┐
                         │   Nginx / Caddy   │
                         │  (SSL, Rate Limit) │
                         └─────────┬─────────┘
                                   │
                                   ▼
═══════════════════════════════════════════════════════════════════════════
                         APPLICATION LAYER
═══════════════════════════════════════════════════════════════════════════
     ┌─────────────────────────────────────────────────────────────┐
     │                     Express API Server                      │
     │                         :5000                               │
     │                                                             │
     │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
     │  │   Auth   │ │   Job    │ │ Payment  │ │    IVR       │  │
     │  │ Module   │ │ Module   │ │ Module   │ │   Module     │  │
     │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
     │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
     │  │  Wallet  │ │  User    │ │  Admin   │ │ Notification │  │
     │  │ Module   │ │ Module   │ │ Module   │ │   Module     │  │
     │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
     │                                                             │
     │  Middleware: Auth │ Validation │ Rate Limit │ Error Handler │
     └────────────────────────────────────┬────────────────────────┘
                                          │
                                          ▼
═══════════════════════════════════════════════════════════════════════════
                          DATA & INTEGRATION LAYER
═══════════════════════════════════════════════════════════════════════════
     ┌──────────────────┐     ┌──────────────────────────────────┐
     │    PostgreSQL     │     │          External APIs           │
     │     Database      │     │                                  │
     │  (Prisma ORM)     │     │  ┌──────────┐ ┌──────────────┐  │
     │                   │     │  │ Razorpay │ │   Twilio     │  │
     │  ┌─ Users         │     │  │ Payments │ │ IVR / SMS    │  │
     │  ├─ Jobs          │     │  └──────────┘ └──────────────┘  │
     │  ├─ Applications  │     │  ┌──────────┐ ┌──────────────┐  │
     │  ├─ Payments      │     │  │  SMTP    │ │  (Redis)     │  │
     │  ├─ Wallets       │     │  │  Email   │ │  Cache/Q     │  │
     │  └─ Contracts     │     │  └──────────┘ └──────────────┘  │
     └──────────────────┘     └──────────────────────────────────┘
```

---

## Data Flow

### Job Posting & Application Flow

```
FARMER                          BACKEND                          WORKER
  │                               │                               │
  │  POST /api/jobs               │                               │
  │  { title, desc, wage,        │                               │
  │    location, duration }       │                               │
  │ ──────────────────────────▶   │                               │
  │                               │  Validate & store in DB      │
  │                               │  Notify nearby workers       │
  │  ◀──────────────────────────  │                               │
  │  { job, status: "active" }   │                               │
  │                               │                               │
  │                               │  GET /api/jobs                │
  │                               │  ◀─────────────────────────   │
  │                               │  ──────────────────────────▶  │
  │                               │  { jobs[], pagination }       │
  │                               │                               │
  │                               │  POST /api/jobs/:id/apply     │
  │                               │  ◀─────────────────────────   │
  │  Notification: "New applicant"│                               │
  │  ◀──────────────────────────  │                               │
  │                               │                               │
  │  PATCH /api/jobs/:id/status   │                               │
  │  { status: "assigned",       │                               │
  │    workerId }                 │                               │
  │ ──────────────────────────▶   │                               │
  │                               │  Notification: "You're hired!"│
  │                               │  ──────────────────────────▶  │
```

---

## Authentication Flow

```
CLIENT                     BACKEND                         DATABASE
  │                          │                                │
  │  POST /api/auth/register │                                │
  │  { name, phone,          │                                │
  │    password, role }      │                                │
  │ ──────────────────────▶  │                                │
  │                          │  Hash password (bcrypt)        │
  │                          │  Create user ───────────────▶  │
  │                          │  Generate OTP                  │
  │                          │  Send via Twilio SMS ───────   │
  │  ◀────────────────────── │                                │
  │  { message: "OTP sent" }  │                                │
  │                          │                                │
  │  POST /api/auth/verify   │                                │
  │  { phone, otp }          │                                │
  │ ──────────────────────▶  │                                │
  │                          │  Verify OTP                    │
  │                          │  Generate JWT pair             │
  │                          │  (access + refresh tokens)     │
  │  ◀────────────────────── │                                │
  │  { accessToken,          │                                │
  │    refreshToken,         │                                │
  │    user }                │                                │
  │                          │                                │
  │  ─── Subsequent requests with Bearer token ────           │
  │                          │                                │
  │  POST /api/auth/refresh  │                                │
  │  { refreshToken }        │                                │
  │ ──────────────────────▶  │                                │
  │                          │  Verify refresh token          │
  │                          │  Issue new access token        │
  │  ◀────────────────────── │                                │
  │  { accessToken }         │                                │
```

---

## Payment Flow (Razorpay)

```
FARMER/WORKER           FRONTEND              BACKEND              RAZORPAY
     │                     │                    │                    │
     │  "Pay Now"          │                    │                    │
     │ ──────────────────▶ │                    │                    │
     │                     │ POST /api/payments │                    │
     │                     │  /create-order     │                    │
     │                     │  { amount, jobId } │                    │
     │                     │ ─────────────────▶ │                    │
     │                     │                    │ Create order       │
     │                     │                    │ ─────────────────▶ │
     │                     │                    │ ◀───────────────── │
     │                     │                    │ { razorpay_order_id│
     │                     │ ◀───────────────── │   amount, etc }    │
     │                     │                    │                    │
     │  Razorpay Checkout  │                    │                    │
     │  ◀───────────────── │                    │                    │
     │                     │                    │                    │
     │  (User completes    │                    │                    │
     │   UPI/Card/NB)      │                    │                    │
     │                     │                    │                    │
     │  POST /api/payments │                    │                    │
     │   /verify           │                    │                    │
     │  { razorpay_* }     │                    │                    │
     │ ──────────────────▶ │ ──────────────────▶│                    │
     │                     │                    │ Verify signature   │
     │                     │                    │ Update DB          │
     │                     │                    │ Credit wallet      │
     │                     │                    │                    │
     │                     │                    │ POST /webhook      │
     │                     │                    │ (payment.captured) │
     │                     │                    │ ◀───────────────── │
     │                     │                    │                    │
     │  ◀───────────────── │ ◀───────────────── │                    │
     │  { success: true }  │                    │                    │
```

---

## IVR Call Flow (Twilio)

```
WORKER              TWILIO               BACKEND              DATABASE
  │                   │                    │                    │
  │  (Answers call)   │                    │                    │
  │ ◀──────────────── │                    │                    │
  │                   │                    │                    │
  │  POST /api/ivr    │                    │                    │
  │  /twiml           │                    │                    │
  │  ────────────────▶│ ──────────────────▶│                    │
  │                   │                    │                    │
  │  "Press 1 for jobs│                    │                    │
  │   2 for balance   │                    │                    │
  │   3 to apply"     │                    │                    │
  │ ◀──────────────── │ ◀───────────────── │                    │
  │                   │  <Gather> TwiML    │                    │
  │                   │                    │                    │
  │  (Presses 1)      │                    │                    │
  │  ────────────────▶│ ──────────────────▶│                    │
  │                   │                    │ Fetch nearby jobs  │
  │                   │                    │ ─────────────────▶ │
  │                   │                    │ ◀───────────────── │
  │                   │                    │                    │
  │  "Jobs near you:  │                    │                    │
  │   Harvesting at   │                    │                    │
  │   Village X..."   │                    │                    │
  │ ◀──────────────── │ ◀───────────────── │                    │
```

---

## Subscription / Escrow Flow

```
1. Farmer posts a job with budget
2. Worker applies
3. Farmer approves & creates escrow payment
4. Backend holds funds via Razorpay (authorize, not capture)
5. Worker marks attendance (daily check-in)
6. On job completion:
   a. Worker marks "Complete"
   b. Farmer approves
   c. Backend captures payment → Worker wallet
7. If dispute: Admin reviews & resolves
```

---

## Folder Structure

```
krushi-rojgar-sandhi/
│
├── apps/web/                          # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── (auth)/                # Login, Register, Forgot Password
│   │   │   ├── (dashboard)/           # Farmer, Worker, Contractor dashboards
│   │   │   │   ├── farmer/            # Farmer-specific pages
│   │   │   │   ├── worker/            # Worker-specific pages
│   │   │   │   └── contractor/        # Contractor-specific pages
│   │   │   ├── jobs/                  # Job listing & details
│   │   │   └── admin/                 # Admin panel
│   │   ├── components/                # Shared UI components
│   │   │   ├── ui/                    # Base UI (Button, Card, Input, Modal...)
│   │   │   ├── layout/               # Navbar, Sidebar, Footer
│   │   │   └── forms/                # Form components
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/                       # Utilities, API client, constants
│   │   ├── store/                     # Zustand state stores
│   │   └── types/                     # TypeScript type definitions
│   ├── public/                        # Static assets
│   └── next.config.mjs                # Next.js configuration
│
├── backend/                           # Express API Server
│   ├── src/
│   │   ├── controllers/               # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── job.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── wallet.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── ivr.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/                 # Express middleware
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   ├── validate.middleware.ts  # Zod validation
│   │   │   ├── error.middleware.ts     # Global error handler
│   │   │   └── rate-limit.middleware.ts
│   │   ├── routes/                    # Route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── job.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── wallet.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── ivr.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── services/                  # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── job.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── ivr.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── twilio.service.ts
│   │   ├── validators/                # Zod validation schemas
│   │   ├── utils/                     # Helpers
│   │   │   ├── logger.ts             # Winston logger
│   │   │   ├── jwt.ts                # JWT helpers
│   │   │   ├── api-response.ts       # Standardized responses
│   │   │   └── constants.ts
│   │   └── server.ts                  # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── prisma/                            # Database
│   ├── schema.prisma                  # Data model
│   ├── migrations/                    # Migration history
│   └── seed.ts                        # Sample data seeder
│
├── docker/                            # Docker configuration
│   ├── backend.Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   └── API.md
│
├── .env.example                       # Environment template
├── .gitignore
├── .nvmrc
├── docker-compose.yml                 # Local dev orchestration
├── vercel.json                        # Vercel deployment config
├── render.yaml                        # Render deployment config
└── README.md
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | Server Components for SEO on job listings, Client Components for interactive dashboards |
| **Zustand over Redux** | Minimal boilerplate, excellent TypeScript support, great for auth/wallet state |
| **Tailwind CSS v4** | Utility-first, rapid prototyping, consistent design system |
| **Prisma ORM** | Type-safe database access, auto-generated types, easy migrations |
| **JWT over Sessions** | Stateless auth suitable for mobile/PWA clients, easy to scale horizontally |
| **Razorpay over Stripe** | Best Indian payment gateway support (UPI, Net Banking, Cards) |
| **Twilio IVR** | Voice-based access for workers without smartphones, supports Hindi/Marathi |
| **Vercel + Render** | Optimal price-performance: Vercel excels at Next.js, Render provides affordable Node hosting with managed PostgreSQL |

---

## Security Measures

- **JWT** with short-lived access tokens (15m) + refresh tokens (7d)
- **bcrypt** with 12 salt rounds for password hashing
- **Helmet** for HTTP security headers
- **Rate limiting** on auth endpoints (100 req/15min per IP)
- **Input validation** via Zod schemas on every endpoint
- **CORS** restricted to known frontend origins
- **Razorpay signature verification** for payment webhooks
- **SQL injection prevention** via Prisma's parameterized queries
- **XSS protection** via Next.js automatic escaping & CSP headers
