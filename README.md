# PhotoboothApp (Evaluation Only)

> **Demo only** – not for commercial use. All images are watermarked "EVALUATION • NOT FOR COMMERCIAL USE".

## Features

- Camera capture via `getUserMedia`
- Rotate and brightness adjustments with watermark
- Credentials auth powered by NextAuth and Prisma (SQLite)
- Gallery with pagination
- REST API with Zod validation and per‑IP rate limiting

## Getting Started

```bash
pnpm install
pnpm db:push && pnpm db:seed
pnpm dev
```

Open <http://localhost:3000>.

## Docker

```bash
docker compose up --build
```

## Scope & Limitations

- Email verification and password reset are mocked.
- Single user seed: `demo@example.com` / `password123`.
- Images stored in SQLite; no external storage.
- Tests cover utilities and basic flow; camera mocked in e2e.

## Next Steps

- Timed capture bursts and additional filters
- Albums and sharing
- Argon2 hashing, CSRF protection
- APM, metrics, and stronger rate limiting

## License

See [LICENSE](./LICENSE). Evaluation only.
