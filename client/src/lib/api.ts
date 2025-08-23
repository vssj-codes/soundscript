import type { Transcription } from "../types/transcription";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export function createTranscription(
  audioUrl: string
): Promise<{ id: string; audioUrl: string; status: Transcription["status"] }> {
  return http("/transcriptions", {
    method: "POST",
    body: JSON.stringify({ audioUrl }),
  });
}

export function listTranscriptions(): Promise<Transcription[]> {
  return http("/transcriptions");
}

export function getTranscription(id: string): Promise<Transcription> {
  return http(`/transcriptions/${id}`);
}
