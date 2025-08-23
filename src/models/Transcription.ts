import { Schema, model, Document } from "mongoose";

export type TranscriptionStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface ITranscription extends Document {
  audioUrl: string;
  status: TranscriptionStatus;
  text: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptionSchema = new Schema<ITranscription>(
  {
    audioUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    text: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Transcription = model<ITranscription>(
  "Transcription",
  TranscriptionSchema
);
export default Transcription;
