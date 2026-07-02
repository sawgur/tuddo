# Tuddo

Landing page for Tuddo — small-group prediction markets where everybody wins.

## Development

```bash
npm install
npm run dev
```

- Web app: [http://localhost:5173](http://localhost:5173)
- Waitlist API is built into the Vite dev server at `/api/waitlist` (no separate server needed)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite (includes waitlist API) |
| `npm run dev:api` | Backend only |
| `npm run build` | Production build |
| `npm run preview` | Build + serve app and API on port 3001 |
| `npm start` | Run API server (serves `dist` if built) |

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
