import { motion } from "framer-motion";
import { ImagePlus, Sparkles, UploadCloud } from "lucide-react";

export default function UploadPanel({
  file,
  onFileChange,
  onDrop,
  onDragOver,
  onSubmit,
  disabled,
  job,
}) {
  return (
    <section className="glass-panel rounded-[30px] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Upload Design</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Design source</h3>
        </div>
        <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">PNG preferred</span>
      </div>

      <motion.label
        whileHover={{ scale: 1.01 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-blue-400/28 bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(15,23,42,0.42))] px-6 py-12 text-center transition hover:border-blue-400/45"
      >
        <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={onFileChange} />
        <div className="mb-4 rounded-2xl bg-blue-500/12 p-4 text-blue-300">
          <UploadCloud size={28} />
        </div>
        <p className="text-lg font-medium text-slate-100">Drag and drop artwork</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">Transparent PNG works best for garment overlays. JPG and WEBP previews are also accepted.</p>
      </motion.label>

      <div className="mt-5 rounded-[24px] border border-white/5 bg-slate-900/40 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-800/80 p-3 text-slate-100">
            <ImagePlus size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">{file?.name ?? "No design selected"}</p>
            <p className="text-xs text-slate-400">{file ? `${Math.round(file.size / 1024)} KB` : "Upload a logo, graphic, or illustration"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(59,130,246,0.24)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles size={18} />
        {job && job.status !== "completed" && job.status !== "failed" ? "Rendering..." : "Render Custom Preview"}
      </button>
    </section>
  );
}
