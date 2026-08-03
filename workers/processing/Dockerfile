FROM node:22.22.2-bookworm-slim AS build

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libgif-dev \
    libjpeg62-turbo-dev \
    libpango1.0-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.worker.json ./
COPY workers ./workers
COPY src/features/ar-items/markerQuality.ts ./src/features/ar-items/markerQuality.ts
COPY src/shared/api/database.types.ts ./src/shared/api/database.types.ts
RUN npm run build:worker

FROM node:22.22.2-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libcairo2 \
    libgif7 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    librsvg2-2 \
    webp \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist-worker ./dist-worker
USER node
CMD ["node", "dist-worker/workers/processing/index.js"]
