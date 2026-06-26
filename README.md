# Tuddo

Landing page for Tuddo — small-group prediction markets where everybody wins.

## Development

Install dependencies and start the frontend + API together:

```bash
npm install
npm run dev
```

- Web app: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001)

The Vite dev server proxies `/api/*` requests to the backend.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite + Express API |
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | Backend only |
| `npm run build` | Production build |
| `npm start` | Run API server |

## Waitlist API

Waitlist signups are stored in SQLite at `data/tuddo.db`.

```bash
POST /api/waitlist
Content-Type: application/json

{ "email": "you@example.com" }
```

## Build

```bash
npm run build
npm run preview
```
