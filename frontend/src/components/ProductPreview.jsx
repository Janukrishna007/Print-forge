import { motion } from "framer-motion";

export default function ProductPreview({
  product,
  view,
  uploadedPreview,
  controls,
  result,
  isRendering,
  onZoomChange,
  onXChange,
  onYChange,
  onSizeChange,
}) {
  const imageUrl = result?.result_url || view?.image_url;
  const area = view?.print_area;
  const imageWidth = view?.image_width || 1;
  const imageHeight = view?.image_height || 1;
  const overlayFrameStyle =
    uploadedPreview && area
      ? {
          left: `${(area.x / imageWidth) * 100}%`,
          top: `${(area.y / imageHeight) * 100}%`,
          width: `${(area.width / imageWidth) * 100}%`,
          height: `${(area.height / imageHeight) * 100}%`,
        }
      : null;

  return (
    <section className="glass-panel flex min-h-[560px] flex-col rounded-[32px] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Preview Studio</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-50">{product?.name ?? "Select a product"}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Build production-ready placement previews with live sizing, repositioning, and asynchronous fabric rendering.
          </p>
        </div>
        {isRendering && (
          <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-200">
            Rendering in progress
          </div>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[28px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.95))] p-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        {imageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex w-full max-w-3xl items-center justify-center"
          >
            <div className="relative inline-block max-w-full">
              <img src={imageUrl} alt={view?.name} className="block max-h-[520px] max-w-full rounded-[28px] object-contain shadow-[0_28px_90px_rgba(2,6,23,0.55)]" />
              {uploadedPreview && !result?.result_url && overlayFrameStyle && (
                <div className="pointer-events-none absolute overflow-hidden" style={overlayFrameStyle}>
                  <img
                    src={uploadedPreview}
                    alt="Uploaded design"
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{
                      transform: `translate(${controls.offsetX}px, ${controls.offsetY}px) scale(${(controls.zoom * controls.printSize) / 100})`,
                      opacity: 1,
                      mixBlendMode: "normal",
                      filter: "drop-shadow(0 8px 18px rgba(15, 23, 42, 0.25))",
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="relative z-10 rounded-3xl border border-dashed border-white/10 px-8 py-16 text-center text-slate-400">
            Product preview appears here once a view is selected.
          </div>
        )}

        {isRendering && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/55 backdrop-blur-sm">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-400/25 border-t-blue-400" />
            <p className="text-sm text-slate-200">Rendering the design into the selected print area...</p>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <label className="rounded-3xl border border-white/5 bg-slate-900/40 p-4">
          <span className="text-sm text-slate-400">Zoom</span>
          <input type="range" min="0.5" max="2" step="0.05" value={controls.zoom} onChange={(e) => onZoomChange(Number(e.target.value))} className="mt-3 w-full accent-blue-500" />
        </label>
        <label className="rounded-3xl border border-white/5 bg-slate-900/40 p-4">
          <span className="text-sm text-slate-400">Horizontal Position</span>
          <input type="range" min="-180" max="180" step="1" value={controls.offsetX} onChange={(e) => onXChange(Number(e.target.value))} className="mt-3 w-full accent-blue-500" />
        </label>
        <label className="rounded-3xl border border-white/5 bg-slate-900/40 p-4">
          <span className="text-sm text-slate-400">Vertical Position</span>
          <input type="range" min="-180" max="180" step="1" value={controls.offsetY} onChange={(e) => onYChange(Number(e.target.value))} className="mt-3 w-full accent-blue-500" />
        </label>
        <label className="rounded-3xl border border-white/5 bg-slate-900/40 p-4">
          <span className="text-sm text-slate-400">Print Size</span>
          <input type="range" min="40" max="160" step="1" value={controls.printSize} onChange={(e) => onSizeChange(Number(e.target.value))} className="mt-3 w-full accent-blue-500" />
        </label>
      </div>
    </section>
  );
}
