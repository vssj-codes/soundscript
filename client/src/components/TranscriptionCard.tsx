import { useEffect, useMemo, useState } from "react";
import type { Transcription } from "../types/transcription";
import { getTranscription } from "../lib/api";

type Props = {
  item: Transcription;
};

function badgeClass(status: Transcription["status"]) {
  switch (status) {
    case "queued":
      return "badge badge-ghost";
    case "processing":
      return "badge badge-info";
    case "completed":
      return "badge badge-success";
    case "failed":
      return "badge badge-error";
    default:
      return "badge";
  }
}

function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() ?? "";
    return decodeURIComponent(last) || "(no name)";
  } catch {
    return "(invalid)";
  }
}

export default function TranscriptionCard({ item }: Props) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<Transcription | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filename = useMemo(
    () => fileNameFromUrl(item.audioUrl),
    [item.audioUrl]
  );

  useEffect(() => {
    // fetch only on first expand
    if (open && !details && !loading) {
      (async () => {
        setErr(null);
        setLoading(true);
        try {
          const d = await getTranscription(item.id);
          setDetails(d);
        } catch (e: any) {
          setErr(e?.message ?? "Failed to load details");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [open, details, loading, item.id]);

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="card-title text-base truncate" title={filename}>
              {filename}
            </h3>
            <a
              className="link link-primary text-sm truncate block"
              href={item.audioUrl}
              target="_blank"
              rel="noreferrer"
              title={item.audioUrl}
            >
              {item.audioUrl}
            </a>
            <div className="text-xs opacity-70 mt-1">
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
            </div>
          </div>
          <span className={badgeClass(item.status)}>{item.status}</span>
        </div>

        <div className="card-actions justify-end mt-3">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide details" : "View details"}
          </button>
        </div>

        {open && (
          <div className="mt-3 border-t border-base-300 pt-3">
            {loading && <div className="loading loading-spinner loading-md" />}

            {err && (
              <div className="alert alert-error">
                <span>{err}</span>
              </div>
            )}

            {!loading && !err && details && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="opacity-70">ID:</span>{" "}
                  <code>{details.id}</code>
                </div>
                {details.text ? (
                  <pre className="whitespace-pre-wrap text-sm bg-base-200 p-3 rounded">
                    {details.text}
                  </pre>
                ) : (
                  <div className="text-sm opacity-70">
                    No transcription text yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
