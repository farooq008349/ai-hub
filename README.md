# AI Hub Backend Starter

This package adds a secure server-side AI layer to the AI Hub frontend.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your AI provider API key in `.env` on the server only.
4. Run `npm install`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Endpoints
- GET `/api/health`
- POST `/api/chat` with `{ "message": "..." }`
- POST `/api/image` with `{ "prompt": "..." }`
- POST `/api/video` with `{ "prompt": "..." }`
- GET `/api/video/:id`

Payment is intentionally not implemented.

Important: image/video generation is not guaranteed to be free. Provider usage is billed according to the provider's current pricing and account limits. Add your own quotas/credits before public launch.
