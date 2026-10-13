FROM oven/bun:1.3.14 AS bun
FROM node:24-bookworm-slim

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

ENV NODE_ENV=development
EXPOSE 3000

CMD ["bun", "run", "dev", "--port", "3000", "--host", "0.0.0.0"]
