FROM node:24.13.1-bookworm-slim AS base
WORKDIR /usr/src/app
RUN chown node:node .
COPY --chown=node:node package.json package-lock.json ./
USER node

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force
COPY --chown=node:node . .
CMD ["node", "server.js"]

FROM base AS development
ENV NODE_ENV=development
RUN npm ci && npm cache clean --force
COPY --chown=node:node . .
CMD ["node", "--watch", "server.js"]