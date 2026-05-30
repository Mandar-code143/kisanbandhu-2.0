# Krushi Rojgar Sandhi — Setup Guide

## Prerequisites

- **Node.js** v20.x (use `nvm install 20 && nvm use 20`)
- **npm** >= 10
- **PostgreSQL** 16 — [Download](https://www.postgresql.org/download/) or use Docker:
  ```bash
  docker run -d --name krushi_pg -e POSTGRES_USER=krushi_admin -e POSTGRES_PASSWORD=krushi_password -e POSTGRES_DB=krushi_rojgar -p 5432:5432 postgres:16-alpine
  ```
- **Git**
- **Docker** & **Docker Compose** (optional, for containerized setup)

---

## 1. Local Development Setup

### 1.1 Clone & Install

```bash
git clone https://github.com/your-org/krushi-rojgar-sandhi.git
cd krushi-rojgar-sandhi
nvm use 20
npm install
```

### 1.2 Environment Configuration

```bash
# Root env (shared variables)
cp .env.example .env

# Backend env
cp backend/.env.example backend/.env

# Frontend env
cp apps/web/.env.example apps/web/.env.local
```

Edit `.env` with your actual values:

```env
DATABASE_URL=postgresql://krushi_admin:krushi_password@localhost:5432/krushi_rojgar
JWT_ACCESS_SECRET=<generate-a-random-64-char-string>
JWT_REFRESH_SECRET=<generate-another-random-64-char-string>
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

> Generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 1.3 Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# (Optional) Seed sample data
npx prisma db seed
```

### 1.4 Run the Application

```bash
# Start both backend & frontend concurrently
npm run dev

# Or start them separately:
npm run dev:backend   # Backend → http://localhost:5000
npm run dev:web       # Frontend → http://localhost:3000
```

The backend exposes a health check at `http://localhost:5000/health`.

---

## 2. Running with Docker

### 2.1 Quick Start

```bash
# Build & start all services
docker compose up -d

# Check logs
docker compose logs -f

# Verify
curl http://localhost:5000/health
open http://localhost:3000
```

### 2.2 Rebuild After Changes

```bash
docker compose build --no-cache backend
docker compose up -d
```

### 2.3 Reset Everything

```bash
docker compose down -v   # Removes volumes (data) too
docker compose up -d
```

### 2.4 Production Build

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 3. Production Deployment

### 3.1 Frontend → Vercel

1. Push code to GitHub/GitLab
2. Import repository in [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `apps/web`
4. Add environment variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxxxxxx` |

5. Deploy

### 3.2 Backend → Render

1. Create a **Web Service** in Render dashboard
2. Connect your GitHub repo
3. Use these settings:

| Setting | Value |
|---------|-------|
| **Runtime** | Node |
| **Build Command** | `npm ci && npx prisma generate && npm run build --workspace=backend` |
| **Start Command** | `npx prisma migrate deploy && node backend/dist/server.js` |
| **Health Check** | `/health` |

4. Add all env vars from `.env.example`
5. Create a **PostgreSQL** database in Render and link it
6. Deploy

Or use `render.yaml` with Render's Blueprint feature:
```bash
render blueprint apply
```

### 3.3 Backend → Railway

```bash
railway login
railway init
railway up
```

Set environment variables via Railway dashboard. Railway automatically provisions PostgreSQL.

---

## 4. External Services Setup

### Razorpay (Payments)

1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Set up webhook endpoint: `https://your-backend.com/api/payments/webhook`
4. Add webhook secret to env vars

### Twilio (IVR / SMS)

1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID & Auth Token from Console
3. Purchase a phone number with Voice capabilities
4. Set up TwiML endpoint or use the built-in IVR flow
5. Configure the voice URL: `https://your-backend.com/api/ivr/twiml`

### SMTP (Email)

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the 16-character app password in `SMTP_PASS`

For SendGrid/Mailgun/etc., update `SMTP_HOST` & `SMTP_PORT` accordingly.

---

## 5. Common Tasks

```bash
# Create a new database migration after schema changes
npx prisma migrate dev --name <description>

# Open Prisma Studio (database GUI)
npx prisma studio

# Run TypeScript type check
npm run lint

# Build for production
npm run build

# Clean all generated files
npm run clean
```

---

## 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to database` | Ensure PostgreSQL is running. Check `DATABASE_URL` in `.env`. |
| `prisma: error...` | Run `npx prisma generate` then `npx prisma migrate dev` |
| `Module not found` | Run `npm install` from the root directory |
| `Port 3000 in use` | Kill the process: `npx kill-port 3000` |
| `Razorpay signature mismatch` | Verify `RAZORPAY_KEY_SECRET` & `RAZORPAY_WEBHOOK_SECRET` are correct |
| `Docker: no space left` | Run `docker system prune -a` to clean unused images |
| `Next.js build fails` | Ensure all env vars with `NEXT_PUBLIC_` prefix are set at build time |
| `IVR not working` | Set `TWILIO_ENABLED=true` and verify phone number is verified in Twilio console |
