import { Download, Layers3 } from "lucide-react";

export default function LivePreviewPanel({ result, error, job, onDownload }) {
  return (
    <section className="glass-panel rounded-[30px] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Live Preview</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Rendered output</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {job ? `${job.progress ?? 0}%` : "Idle"}
        </div>
      </div>

      <div className="flex min-h-[280px] items-center justify-center rounded-[28px] border border-white/5 bg-slate-950/45 p-4">
        {result?.result_url ? (
          <img src={result.result_url} alt="Rendered result" className="max-h-[280px] rounded-[24px] object-contain shadow-[0_20px_60px_rgba(2,6,23,0.45)]" />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-300">
              <Layers3 size={22} />
            </div>
            <p className="text-sm font-medium text-slate-100">No render available yet</p>
            <p className="mt-2 text-sm text-slate-400">
              {error ? error : "Your latest render will appear here once the worker finishes processing."}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onDownload}
        disabled={!result?.result_url}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download size={18} />
        Download Final Render
      </button>
    </section>
  );
}
