import { useEffect, useMemo, useRef, useState } from "react";
import type { Transcription } from "../types/transcription";
import { listTranscriptions, getTranscription } from "../lib/api";

type Props = {
  refreshKey: number;
};
const formatDateTime = (value: string | number | Date) => {
  const d = new Date(value);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const time = d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .toLowerCase();
  return `${date} ${time}`; // e.g., 23/08/2025, 6:46 pm
};

function badgeClass(status: Transcription["status"]) {
  const base = "badge text-white";
  switch (status) {
    case "queued":
      return `${base} badge-warning`; // was badge-ghost
    case "processing":
      return `${base} badge-info`;
    case "completed":
      return `${base} badge-success`;
    case "failed":
      return `${base} badge-error`;
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

export default function TranscriptionTable({ refreshKey }: Props) {
  const [rows, setRows] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selected, setSelected] = useState<Transcription | null>(null);
  const [details, setDetails] = useState<Transcription | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsErr, setDetailsErr] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);

  async function fetchAll() {
    setErr(null);
    setLoading(true);
    try {
      const data = await listTranscriptions();
      setRows(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to fetch transcriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  function openDetails(row: Transcription) {
    setSelected(row);
    setDetails(null);
    setDetailsErr(null);
    setDetailsLoading(true);
    dialogRef.current?.showModal(); // open modal first (lazy-load content)

    getTranscription(row.id)
      .then((d) => setDetails(d))
      .catch((e: any) => setDetailsErr(e?.message ?? "Failed to load details"))
      .finally(() => setDetailsLoading(false));
  }

  function closeDetails() {
    dialogRef.current?.close();
    setSelected(null);
    setDetails(null);
    setDetailsErr(null);
  }

  const tableBody = useMemo(
    () =>
      rows.map((r) => (
        <tr key={r.id}>
          <td
            className="truncate max-w-[220px]"
            title={fileNameFromUrl(r.audioUrl)}
          >
            {fileNameFromUrl(r.audioUrl)}
          </td>
          <td className="truncate max-w-[360px]" title={r.audioUrl}>
            <a
              className="link link-primary"
              href={r.audioUrl}
              target="_blank"
              rel="noreferrer"
            >
              {r.audioUrl}
            </a>
          </td>
          <td>
            <span className={badgeClass(r.status)}>{r.status}</span>
          </td>
          <td className="whitespace-nowrap">
            {r.createdAt ? formatDateTime(r.createdAt) : ""}
          </td>

          <td className="text-right">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openDetails(r)}
              title="View"
            >
              {/* eye icon (inline SVG, no extra deps) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322c.2-.508 1.768-4.822 6.018-6.79A9.05 9.05 0 0112 4.5c1.58 0 3.087.38 4.43 1.032 4.25 1.968 5.818 6.282 6.018 6.79a.75.75 0 010 .356c-.2.508-1.768 4.822-6.018 6.79A9.05 9.05 0 0112 19.5c-1.58 0-3.087-.38-4.43-1.032-4.25-1.968-5.818-6.282-6.018-6.79a.75.75 0 010-.356z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </td>
        </tr>
      )),
    [rows]
  );

  return (
    <div className="card bg-base-100 shadow-xl min-h-[50vh]">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Transcriptions</h2>
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

        {err && (
          <div className="alert alert-error my-3">
            <span>{err}</span>
          </div>
        )}

        {!loading && !err && rows.length === 0 && (
          <p className="text-sm opacity-70">
            No transcriptions yet. Create one above.
          </p>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>{tableBody}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">
            {selected
              ? `Transcription of ${fileNameFromUrl(selected.audioUrl)}`
              : "Details"}
          </h3>

          <div className="mt-4">
            {detailsLoading && (
              <div className="loading loading-spinner loading-md" />
            )}

            {detailsErr && (
              <div className="alert alert-error">
                <span>{detailsErr}</span>
              </div>
            )}

            {!detailsLoading && !detailsErr && details && (
              <>
                {/* <div className="text-sm mb-2">
                  <span className="opacity-70">ID:</span>{" "}
                  <code>{details.id}</code>
                </div> */}
                {details.text ? (
                  <pre className="whitespace-pre-wrap text-sm bg-base-200 p-3 rounded">
                    {details.text}
                  </pre>
                ) : (
                  <div className="text-sm opacity-70">
                    No transcription text yet.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-action">
            <button className="btn" onClick={closeDetails}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
