import { useEffect, useState } from "react";
import type { Transcription } from "../types/transcription";
import { listTranscriptions } from "../lib/api";
import TranscriptionCard from "./TranscriptionCard";

type Props = {
  refreshKey: number;
};

export default function TranscriptionList({ refreshKey }: Props) {
  const [items, setItems] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setError(null);
    setLoading(true);
    try {
      const data = await listTranscriptions();
      setItems(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch transcriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="card bg-gray-100 shadow-xl min-h-[50vh]">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Recent Transcriptions</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchAll}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="loading loading-spinner loading-md mx-auto my-6" />
        )}

        {error && (
          <div className="alert alert-error my-3">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm opacity-70">
            No transcriptions yet. Create one above.
          </p>
        )}

        <div className="grid grid-cols-1  gap-4">
          {items.map((t) => (
            <TranscriptionCard key={t.id} item={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
