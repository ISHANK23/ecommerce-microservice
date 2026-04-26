# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_PRODUCT_SERVICE_URL
ARG NEXT_PUBLIC_PAYMENT_SERVICE_URL

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_PRODUCT_SERVICE_URL=$NEXT_PUBLIC_PRODUCT_SERVICE_URL
ENV NEXT_PUBLIC_PAYMENT_SERVICE_URL=$NEXT_PUBLIC_PAYMENT_SERVICE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
