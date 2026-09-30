# --- Frontend build ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Backend build ---
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate && npx tsc

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

EXPOSE 7000
CMD ["node", "./dist/index.js"]
