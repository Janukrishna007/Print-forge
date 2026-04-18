import { motion } from "framer-motion";
import { CloudUpload, FileImage, WandSparkles } from "lucide-react";

export default function UploadPanel({
  file,
  onFileChange,
  onDrop,
  onDragOver,
  onSubmit,
  disabled,
  job,
  selectedProductName,
  selectedViewName,
}) {
  const checklist = [
    { label: "Product", value: selectedProductName || "Choose a product", complete: Boolean(selectedProductName) },
    { label: "View", value: selectedViewName || "Choose a view", complete: Boolean(selectedViewName) },
    { label: "Design", value: file?.name || "Upload artwork", complete: Boolean(file) },
  ];

  return (
    <section className="glass-panel rounded-[26px] p-4 sm:rounded-[30px] sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="panel-eyebrow">Step 2 Upload Design</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Design source</h3>
        </div>
        <span className="status-pill rounded-full px-3 py-1 text-xs text-sky-100">PNG preferred</span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2">
        {checklist.map((item) => (
          <div key={item.label} className="soft-card flex items-center justify-between rounded-[18px] px-3 py-2.5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm text-slate-200">{item.value}</p>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${item.complete ? "bg-emerald-300" : "bg-slate-600"}`} />
          </div>
        ))}
      </div>

      <motion.label
        whileHover={{ scale: 1.01 }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-sky-400/28 bg-[linear-gradient(180deg,rgba(14,165,233,0.14),rgba(15,23,42,0.42))] px-4 py-8 text-center transition hover:border-sky-400/45 sm:rounded-[28px] sm:px-6 sm:py-12"
      >
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/45 to-transparent" />
        <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={onFileChange} />
        <div className="mb-4 rounded-2xl border border-sky-300/12 bg-sky-400/10 p-4 text-sky-300">
          <CloudUpload size={28} />
        </div>
        <p className="text-lg font-medium text-slate-100">Drag and drop artwork</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Transparent PNG works best for garment overlays. JPG and WEBP previews are also accepted.</p>
      </motion.label>

      <div className="soft-card mt-4 rounded-[22px] p-4 sm:mt-5 sm:rounded-[24px]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/8 bg-slate-800/80 p-3 text-slate-100">
            <FileImage size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">{file?.name ?? "No design selected"}</p>
            <p className="text-xs text-slate-400">{file ? `${Math.round(file.size / 1024)} KB` : "Upload a logo, graphic, or illustration"}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled}
        className="primary-button mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5"
      >
        <WandSparkles size={18} />
        {job && job.status !== "completed" && job.status !== "failed" ? "Rendering..." : "Render Final Preview"}
      </button>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        Next: once rendering finishes, the final preview appears in the Live Preview panel right below for download.
      </p>
    </section>
  );
}
