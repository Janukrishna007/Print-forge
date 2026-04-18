import { CheckCircle2, Clock3, Download, ImageUp } from "lucide-react";

export default function LivePreviewPanel({ result, error, job, onDownload }) {
  const isCompleted = job?.status === "completed" && result?.result_url;

  return (
    <section className="glass-panel rounded-[26px] p-4 sm:rounded-[30px] sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="panel-eyebrow">Step 3 Download</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Rendered output</h3>
        </div>
        <div className="status-pill flex items-center gap-2 rounded-full px-3 py-1 text-xs">
          {isCompleted ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Clock3 size={14} className="text-sky-300" />}
          {job ? `${job.progress ?? 0}%` : "Idle"}
        </div>
      </div>

      <div className="soft-card flex min-h-[220px] items-center justify-center rounded-[24px] p-4 sm:min-h-[280px] sm:rounded-[28px]">
        {result?.result_url ? (
          <img src={result.result_url} alt="Rendered result" className="max-h-[220px] rounded-[20px] object-contain shadow-[0_20px_60px_rgba(2,6,23,0.45)] sm:max-h-[280px] sm:rounded-[24px]" />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-slate-800/80 text-slate-300">
              <ImageUp size={22} />
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
        className="secondary-button mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-400/25 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-5"
      >
        <Download size={18} />
        Download Final Product
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        This panel is the finish line on mobile: render first, then tap the download button to save the final mockup.
      </p>
    </section>
  );
}
