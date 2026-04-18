import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Maximize2, MoveHorizontal, MoveVertical, ScanSearch, Sparkles } from "lucide-react";

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
  const area = view?.print_area;
  const imageWidth = view?.image_width || 1;
  const imageHeight = view?.image_height || 1;
  const hasBaseProduct = Boolean(view?.image_url);
  const hasPlacementPreview = Boolean(uploadedPreview && area && view?.image_url);
  const hasRenderedPreview = Boolean(result?.result_url);
  const previewModes = useMemo(
    () => [
      { key: "product", label: "Product", enabled: hasBaseProduct },
      { key: "placement", label: "Placement", enabled: hasPlacementPreview },
      { key: "rendered", label: "Rendered", enabled: hasRenderedPreview },
    ],
    [hasBaseProduct, hasPlacementPreview, hasRenderedPreview],
  );
  const [previewMode, setPreviewMode] = useState("product");
  const overlayFrameStyle =
    uploadedPreview && area
      ? {
          left: `${(area.x / imageWidth) * 100}%`,
          top: `${(area.y / imageHeight) * 100}%`,
          width: `${(area.width / imageWidth) * 100}%`,
          height: `${(area.height / imageHeight) * 100}%`,
      }
      : null;

  useEffect(() => {
    if (hasRenderedPreview) {
      setPreviewMode("rendered");
      return;
    }
    if (hasPlacementPreview) {
      setPreviewMode("placement");
      return;
    }
    setPreviewMode("product");
  }, [hasRenderedPreview, hasPlacementPreview, view?.id, uploadedPreview]);

  useEffect(() => {
    const modeStillAvailable = previewModes.some((mode) => mode.key === previewMode && mode.enabled);
    if (!modeStillAvailable) {
      if (hasRenderedPreview) {
        setPreviewMode("rendered");
      } else if (hasPlacementPreview) {
        setPreviewMode("placement");
      } else {
        setPreviewMode("product");
      }
    }
  }, [previewMode, previewModes, hasRenderedPreview, hasPlacementPreview]);

  const showOverlay = previewMode === "placement" && hasPlacementPreview && overlayFrameStyle;
  const imageUrl =
    previewMode === "rendered" && hasRenderedPreview
      ? result?.result_url
      : view?.image_url;
  const controlItems = [
    {
      label: "Zoom",
      value: `${controls.zoom.toFixed(2)}x`,
      icon: Maximize2,
      input: <input type="range" min="0.5" max="2" step="0.05" value={controls.zoom} onChange={(e) => onZoomChange(Number(e.target.value))} className="range-input mt-4 w-full" />,
    },
    {
      label: "Horizontal Position",
      value: `${controls.offsetX}px`,
      icon: MoveHorizontal,
      input: <input type="range" min="-180" max="180" step="1" value={controls.offsetX} onChange={(e) => onXChange(Number(e.target.value))} className="range-input mt-4 w-full" />,
    },
    {
      label: "Vertical Position",
      value: `${controls.offsetY}px`,
      icon: MoveVertical,
      input: <input type="range" min="-180" max="180" step="1" value={controls.offsetY} onChange={(e) => onYChange(Number(e.target.value))} className="range-input mt-4 w-full" />,
    },
    {
      label: "Print Size",
      value: `${controls.printSize}%`,
      icon: ScanSearch,
      input: <input type="range" min="40" max="160" step="1" value={controls.printSize} onChange={(e) => onSizeChange(Number(e.target.value))} className="range-input mt-4 w-full" />,
    },
  ];

  return (
    <section className="glass-panel flex min-h-[420px] flex-col rounded-[28px] p-4 sm:min-h-[560px] sm:rounded-[32px] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="panel-eyebrow">Step 1 View And Adjust</span>
            {view?.name ? <span className="status-pill rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.22em]">{view.name}</span> : null}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">{product?.name ?? "Select a product"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Fine-tune placement with live controls, then render the final mockup without leaving the workspace.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="grid w-full grid-cols-3 rounded-[20px] border border-white/10 bg-slate-950/55 p-1.5 sm:w-auto sm:min-w-[320px]">
            {previewModes.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => mode.enabled && setPreviewMode(mode.key)}
                disabled={!mode.enabled}
                className={`rounded-[14px] px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  previewMode === mode.key && mode.enabled
                    ? "bg-gradient-to-r from-sky-500 via-blue-500 to-blue-700 text-white"
                    : mode.enabled
                      ? "text-slate-300 hover:bg-white/5"
                      : "cursor-not-allowed text-slate-600"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {isRendering && (
            <div className="status-pill flex items-center gap-2 rounded-full px-4 py-2 text-sm text-sky-100">
              <Sparkles size={15} className="text-sky-300" />
              Rendering in progress
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(180deg,_rgba(8,15,29,0.98),_rgba(3,8,20,0.98))] p-4 sm:rounded-[28px] sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        {imageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex w-full max-w-3xl items-center justify-center"
          >
            <div className="relative inline-block max-w-full">
              <img src={imageUrl} alt={view?.name} className="block max-h-[320px] max-w-full rounded-[22px] object-contain shadow-[0_28px_90px_rgba(2,6,23,0.55)] sm:max-h-[520px] sm:rounded-[28px]" />
              {showOverlay && (
                <div className="pointer-events-none absolute overflow-hidden rounded-[8px] ring-1 ring-sky-300/25" style={overlayFrameStyle}>
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-slate-900/60 text-slate-300">
              <ImageIcon size={22} />
            </div>
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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
        {controlItems.map((item) => {
          const Icon = item.icon;
          return (
            <label key={item.label} className="soft-card rounded-[22px] p-3 sm:rounded-3xl sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <Icon size={16} className="text-sky-300" />
                  {item.label}
                </span>
                <span className="rounded-full border border-white/5 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-400">{item.value}</span>
              </div>
              {item.input}
            </label>
          );
        })}
      </div>
    </section>
  );
}
