FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY backend/package.json backend/tsconfig.json ./backend/
COPY prisma/ ./prisma/

RUN npm ci --workspace=backend

COPY backend/src/ ./backend/src/

RUN npx prisma generate
RUN npm run build --workspace=backend

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl ca-certificates tzdata

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/backend/package.json ./backend/

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

USER node

CMD ["sh", "-c", "npx prisma migrate deploy && node backend/dist/server.js"]
