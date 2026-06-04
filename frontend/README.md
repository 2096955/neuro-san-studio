# NeuroSAN Frontend

This is the frontend application for NeuroSAN, merged from the RAI-Dashboard project with NeuroSAN's blue/light color theme applied.

## Overview

The frontend is built with:
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **React Flow** for graph/network visualization
- **Material-UI** for some components

## Color Theme

The application uses NeuroSAN's blue/light theme, matching the `network_pro.html` template:
- Primary: Blue (`#2563eb`)
- Background: Light gray (`#f5f7fa`)
- Cards: White (`#ffffff`)
- Text: Dark slate (`#1e293b`)

See [COLOR_THEME_MIGRATION.md](./COLOR_THEME_MIGRATION.md) for detailed color reference and migration guide.

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── rai/          # RAI-specific components
│   │   ├── common/       # Shared components
│   │   ├── forms/        # Form components
│   │   └── ui/           # UI primitives
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles & theme
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json          # Dependencies
```

## Environment

Create `.env` or `.env.local` in the frontend directory and set:

- **VITE_API_BASE_URL** – Backend API base URL (REST, WebSocket, SSE). Default when unset: `http://localhost:8000`
- **PLAYWRIGHT_BASE_URL** (optional) – Base URL for Playwright e2e tests; also used as `webServer.url`. Default: `http://localhost:5173`

Example:
```bash
VITE_API_BASE_URL=http://localhost:8000
# PLAYWRIGHT_BASE_URL=http://localhost:5173
```

All API calls use the single config in `src/config/api.ts`.

## Backend Integration

**Integrated with Neuro SAN Studio:** When you run `python -m run` from the repo root, the Studio API (Flask `app.py`) starts on port **8000** and exposes `/api/networks`, `/api/topology`, `/api/chat`, and related endpoints. The Vite frontend defaults to `VITE_API_BASE_URL=http://localhost:8000`, so:

1. From repo root: `python -m run` (starts Neuro SAN server, NSFlow, and Studio API on 8000).
2. In another terminal: `cd frontend && npm run dev`.
3. Open http://localhost:5173 — the Multi-Agent Accelerator and chat will use the Studio API.

To disable the Studio API when running the backend (e.g. if you only use NSFlow), run: `python -m run --no-studio-api`.

Current service files in `src/services/` use `API_BASE_URL` from `src/config/api.ts`:
- `AIRegistryService.ts`
- `AIRegistryStatsService.ts`
- `ChatService.ts` – uses `/api/chat` with `network_name` and `message`
- `GuardrailsHistoryService.ts`

## Key Features

- **RAI Dashboard**: Responsible AI monitoring and metrics
- **AI Registry**: System registration and compliance tracking
- **Guardrails**: Guardrail configuration and monitoring
- **Policies**: Policy management
- **Charts & Visualizations**: Trust scores, bias detection, PII leakage, etc.
- **Real-time Updates**: SSE (Server-Sent Events) support for live data

## Color Theme Customization

Colors are defined in:
1. `src/index.css` - CSS variables using `@theme`
2. `tailwind.config.js` - Tailwind color extensions

To update colors, modify these files. The theme uses semantic naming:
- `background` / `foreground` - Main background and text
- `primary` - Primary action color (blue)
- `card` - Card backgrounds
- `muted` - Muted backgrounds and text
- `border` - Border colors

## Migration Status

✅ Core theme files updated
✅ Main navigation components updated
✅ Key page components updated
⚠️ Some chart and card components may still have old color references

See [COLOR_THEME_MIGRATION.md](./COLOR_THEME_MIGRATION.md) for details on remaining updates.

## License

Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
All Rights Reserved.
Issued under the Academic Public License.
