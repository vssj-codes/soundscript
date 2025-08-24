import { useEffect, useState } from "react";
import { createTranscription } from "../lib/api";

const fileNameFromUrl = (s: string) => {
  try {
    const u = new URL(s);
    const last = u.pathname.split("/").pop() ?? "";
    return decodeURIComponent(last) || "(untitled)";
  } catch {
    return "(invalid)";
  }
};

const audioExt = /\.(mp3|wav|ogg|flac|m4a)$/i;
const isValidUrl = (s: string) => {
  try {
    const u = new URL(s);
    return (
      (u.protocol === "http:" || u.protocol === "https:") &&
      audioExt.test(u.pathname)
    );
  } catch {
    return false;
  }
};

export default function TranscriptionForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(audioUrl)) {
      setToast({
        type: "err",
        text: "Enter a valid audio URL (.mp3/.wav/.ogg/.flac/.m4a)",
      });
      return;
    }
    setLoading(true);
    try {
      const { id } = await createTranscription(audioUrl);
      setToast({ type: "ok", text: `Queued: ${fileNameFromUrl(audioUrl)}` });
      setAudioUrl("");
      onCreated();
    } catch (e: any) {
      setToast({
        type: "err",
        text: e?.message ?? "Failed to create transcription",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Create Transcription</h2>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="url"
              required
              placeholder="https://example.com/sample.mp3"
              className="input input-bordered w-full"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-middle z-50">
          <div
            className={`alert ${
              toast.type === "err" ? "alert-error" : "alert-success"
            }`}
          >
            <span>{toast.text}</span>
          </div>
        </div>
      )}
    </>
  );
}
