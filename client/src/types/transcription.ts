export type TranscriptionStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface Transcription {
  id: string;
  audioUrl: string;
  status: TranscriptionStatus;
  text?: string | null;
  createdAt?: string;
}
