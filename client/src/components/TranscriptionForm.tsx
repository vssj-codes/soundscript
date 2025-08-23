import { useState } from "react";
import { createTranscription } from "../lib/api";

type Props = {
  onCreated: () => void;
};

const audioExt = /\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i;

export default function TranscriptionForm({ onCreated }: Props) {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = (url: string) => {
    try {
      const u = new URL(url);
      return (
        (u.protocol === "http:" || u.protocol === "https:") &&
        audioExt.test(u.pathname)
      );
    } catch {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate(audioUrl)) {
      setError(
        "Please enter a valid audio URL (mp3/wav/ogg/flac/m4a/aac/opus)."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await createTranscription(audioUrl);
      setSuccess(`Queued: ${res.id}`);
      setAudioUrl("");
      onCreated(); // trigger list refresh
    } catch (err: any) {
      setError(err?.message ?? "Failed to create transcription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create Transcription</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="url"
            placeholder="https://example.com/sample.mp3"
            className="input input-bordered w-full"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
          />
          <div className="card-actions justify-end">
            <button
              className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error mt-3">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success mt-3">
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}
