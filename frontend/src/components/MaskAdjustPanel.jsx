import { Crop, RotateCcw, Save } from "lucide-react";

const fields = [
  { key: "x", label: "Mask X", min: 0, step: 1 },
  { key: "y", label: "Mask Y", min: 0, step: 1 },
  { key: "width", label: "Mask Width", min: 40, step: 1 },
  { key: "height", label: "Mask Height", min: 40, step: 1 },
];

export default function MaskAdjustPanel({
  draftArea,
  maxWidth,
  maxHeight,
  saving,
  onChange,
  onReset,
  onSave,
}) {
  return (
    <section className="glass-panel rounded-[30px] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Mask Adjustment</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Print display area</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs text-slate-300">
          {maxWidth} x {maxHeight}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="rounded-[24px] border border-white/5 bg-slate-900/35 p-4">
            <span className="text-sm text-slate-400">{field.label}</span>
            <input
              type="number"
              min={field.min}
              max={field.key === "x" || field.key === "width" ? maxWidth : maxHeight}
              step={field.step}
              value={draftArea[field.key]}
              onChange={(event) => onChange(field.key, Number(event.target.value))}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none ring-0 transition focus:border-blue-400/40"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-[24px] border border-dashed border-blue-400/25 bg-blue-500/5 p-4 text-sm text-slate-300">
        The blue overlay in preview follows this area. Saving also refreshes the perspective points to match the new mask bounds.
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/70"
        >
          <RotateCcw size={18} />
          Reset
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Crop size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Mask Area"}
        </button>
      </div>
    </section>
  );
}
