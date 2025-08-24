# SoundScript – Frontend (React + TypeScript + DaisyUI)

## Overview

Simple UI to:

1. Submit an audio URL.
2. View all transcriptions in a table.
3. Open a modal to view transcription.

## Folder structure

```
src/
  App.tsx
  index.css
  components/
    TranscriptionForm.tsx
    TranscriptionTable.tsx
  lib/
    api.ts
  types/
    transcription.ts
```

## Getting started

```bash
cd client
npm install
npm run dev
```

## Assumptions

- Backend runs at `http://localhost:3000` with CORS allowing `http://localhost:5173`.
- Valid audio URLs end with common extensions (`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.opus`).

## How I’d take this to production

- Use React Query for caching, retries, and background refresh.
- Poll or server-push (SSE/WebSocket) to auto-update statuses.
- Pagination/sort/filter on the table; copy link / share actions.
- Error boundaries, suspense, and skeleton loaders.
- Accessibility pass (focus management for modal, ARIA labels).
- Responsive UI

## Running both locally

- **Terminal 1 (backend)**:

  ```bash
  npm run dev    # from backend root
  ```

- **Terminal 2 (frontend)**:

  ```bash
  cd client && npm run dev
  ```
