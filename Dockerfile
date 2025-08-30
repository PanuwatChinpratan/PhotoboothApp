FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml package-lock.json* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
