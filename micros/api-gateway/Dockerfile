FROM node:22-alpine AS build
WORKDIR /repo

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY micros/api-gateway ./micros/api-gateway

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @qeetmart/api-gateway build

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /repo/micros/api-gateway/package.json ./
COPY --from=build /repo/micros/api-gateway/dist ./dist
COPY --from=build /repo/micros/api-gateway/node_modules ./node_modules

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
