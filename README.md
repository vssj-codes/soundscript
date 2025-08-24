# Task Summary

Minimal API that accepts

- audio file URL,
- mocks the download/transcription, and
- stores results in MongoDB
- simple UI to test the API endpoints

## SoundScript – Backend (Node + TypeScript)

#### Folder structure

```
src/
  app.ts
  config/
    database.ts
  models/
    Transcription.ts
  routes/
    transcriptionRoutes.ts
  utils/
    downloadAudio.ts
    validateAudioUrl.ts
    validateObjectId.ts
  types/
    env.d.ts
```

## Getting started

```bash
# from repo root
npm install
npm run dev
```

## API

### POST `/transcriptions`

Create a transcription job (mocked download + transcription happens asynchronously).
**Request**

```json
{ "audioUrl": "https://example.com/sample.mp3" }
```

**201 Response**

```json
{
  "id": "<mongoId>",
  "audioUrl": "https://…/sample.mp3",
  "status": "queued"
}
```

**Errors**

- `400` invalid URL or duplicate URL
- `500` server error

### GET `/transcriptions/:id`

Fetch a single transcription.

**200 Response**

```json
{
  "id": "<mongoId>",
  "audioUrl": "https://…/sample.mp3",
  "status": "queued|processing|completed|failed",
  "text": "Mock transcription …"
}
```

### GET `/transcriptions`

List all transcriptions (newest first).

**200 Response**

```json
[
  {
    "id": "<mongoId>",
    "audioUrl": "…",
    "status": "completed",
    "text": "…",
    "createdAt": "…"
  }
]
```

## Notable details

- **Validation**: `validateAudioUrl.ts` (protocol + extension), `validateObjectId.ts`.
- **Model**: `Transcription.ts` with fields `{ audioUrl (unique), status, text, timestamps }`.
- **Async flow**: route responds immediately; processing runs in `setImmediate`:

  - status: `queued → processing → completed|failed`
  - retry logic in `utils/downloadAudio.ts` (configurable attempts & delay)

- **CORS**: allowed origin via `CLIENT_ORIGIN`.

## Assumptions

- `MONGO_URI` is reachable; unique by `audioUrl` to avoid duplicate jobs.
- “Transcription” is mocked; no actual speech-to-text.
- No auth; public endpoints for evaluation.

## How I’d take this to production

1. Real worker & queue (BullMQ/RabbitMQ/SQS) instead of `setTimeout`.
2. Store audio/transcripts in object storage (S3/GCS); only URLs in DB.
3. Schema indexes + pagination for GET list (limit/offset or cursor).
