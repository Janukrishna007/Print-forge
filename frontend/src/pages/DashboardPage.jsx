import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertCircle, CheckCircle2, Download, Layers3, Shirt, Upload, WandSparkles } from "lucide-react";

import LivePreviewPanel from "../components/LivePreviewPanel";
import MaskAdjustPanel from "../components/MaskAdjustPanel";
import ProductPreview from "../components/ProductPreview";
import Sidebar from "../components/Sidebar";
import UploadPanel from "../components/UploadPanel";
import ViewTabs from "../components/ViewTabs";
import { useCustomization } from "../hooks/useCustomization";
import { useProducts } from "../hooks/useProducts";

export default function DashboardPage() {
  const { products, selectedProduct, selectedView, setSelectedView, selectProduct, saveViewMapping, loading, error } = useProducts();
  const { job, result, error: customizationError, startCustomization, resetCustomizationState, isRendering } = useCustomization();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mappingDraft, setMappingDraft] = useState({ x: 120, y: 160, width: 520, height: 520 });
  const [savingMask, setSavingMask] = useState(false);
  const [previewDirty, setPreviewDirty] = useState(false);
  const [controls, setControls] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    printSize: 100,
  });

  const combinedError = customizationError || error;
  const selectedViewWidth = selectedView?.image_width || 1200;
  const selectedViewHeight = selectedView?.image_height || 1200;
  const hasProduct = Boolean(selectedProduct);
  const hasView = Boolean(selectedView);
  const hasUpload = Boolean(file);

  const stats = useMemo(
    () => [
      { label: "Product Views", value: selectedProduct?.views?.length ?? 0, icon: Layers3 },
      { label: "Render Progress", value: `${job?.progress ?? 0}%`, icon: Activity },
      { label: "Render Mode", value: "Preview Safe", icon: WandSparkles },
    ],
    [selectedProduct, job],
  );

  useEffect(() => {
    if (!selectedView?.print_area) return;
    setMappingDraft({
      x: Number(selectedView.print_area.x ?? 0),
      y: Number(selectedView.print_area.y ?? 0),
      width: Number(selectedView.print_area.width ?? 520),
      height: Number(selectedView.print_area.height ?? 520),
    });
  }, [selectedView]);

  useEffect(() => {
    if (!job && !result) return;
    if (isRendering) return;
    setPreviewDirty(true);
    resetCustomizationState();
  }, [controls.zoom, controls.offsetX, controls.offsetY, controls.printSize, previewUrl, selectedView?.id]);

  function updateFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  function handleFileChange(event) {
    updateFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    updateFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  async function handleSubmit() {
    if (!file || !selectedProduct || !selectedView) return;
    const formData = new FormData();
    formData.append("product_id", selectedProduct.id);
    formData.append("product_view_id", selectedView.id);
    formData.append("design", file);
    formData.append("scale", controls.zoom);
    formData.append("offset_x", controls.offsetX);
    formData.append("offset_y", controls.offsetY);
    formData.append("print_size", controls.printSize);
    formData.append("opacity", 0.95);
    formData.append("blend_mode", "soft_light");
    setPreviewDirty(false);
    await startCustomization(formData);
  }

  async function handleDownload() {
    if (!result?.result_url) return;
    const response = await fetch(result.result_url);
    if (!response.ok) {
      throw new Error("Unable to download the generated image.");
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fallbackName = `${selectedProduct?.slug || "printforge-render"}-${selectedView?.name || "view"}-${result.id || "result"}.png`;
    link.href = objectUrl;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  function clampArea(nextArea) {
    const width = Math.max(40, Math.min(Number(nextArea.width) || 40, selectedViewWidth));
    const height = Math.max(40, Math.min(Number(nextArea.height) || 40, selectedViewHeight));
    const x = Math.max(0, Math.min(Number(nextArea.x) || 0, Math.max(0, selectedViewWidth - width)));
    const y = Math.max(0, Math.min(Number(nextArea.y) || 0, Math.max(0, selectedViewHeight - height)));
    return { x, y, width, height };
  }

  function handleMaskFieldChange(field, value) {
    setMappingDraft((current) => clampArea({ ...current, [field]: value }));
  }

  function handleMaskReset() {
    if (!selectedView?.print_area) return;
    setMappingDraft({
      x: Number(selectedView.print_area.x ?? 0),
      y: Number(selectedView.print_area.y ?? 0),
      width: Number(selectedView.print_area.width ?? 520),
      height: Number(selectedView.print_area.height ?? 520),
    });
  }

  async function handleMaskSave() {
    if (!selectedView) return;
    setSavingMask(true);
    try {
      await saveViewMapping(selectedView.id, clampArea(mappingDraft));
    } finally {
      setSavingMask(false);
    }
  }

  const displayView =
    selectedView && mappingDraft
      ? {
          ...selectedView,
          print_area: mappingDraft,
        }
      : selectedView;
  const activeResult = previewDirty ? null : result;
  const hasRenderedResult = Boolean(activeResult?.result_url);
  const mobileWorkflow = [
    {
      label: "Choose Product",
      detail: hasProduct ? selectedProduct.name : "Pick a product from the catalog",
      complete: hasProduct,
      icon: Shirt,
    },
    {
      label: "Upload Design",
      detail: hasUpload ? file.name : "Add your artwork file",
      complete: hasUpload,
      icon: Upload,
    },
    {
      label: "Download Result",
      detail: hasRenderedResult ? "Final preview is ready" : "Render, then download the final mockup",
      complete: hasRenderedResult,
      icon: Download,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden px-3 py-3 text-white sm:px-4 sm:py-4 md:px-6 lg:px-8 xl:h-screen xl:overflow-hidden">
      <section className="glass-panel mb-3 rounded-[24px] p-4 xl:hidden">
        <div className="mb-4">
          <p className="panel-eyebrow">Mobile Workflow</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-50">Follow these steps to get your final product fast.</h2>
        </div>
        <div className="space-y-3">
          {mobileWorkflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="soft-card rounded-[20px] p-3.5">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.complete ? "bg-emerald-500/15 text-emerald-300" : "bg-sky-500/12 text-sky-300"}`}>
                    {item.complete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100">Step {index + 1}: {item.label}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">{item.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mx-auto grid max-w-[1680px] grid-cols-1 gap-3 xl:h-full xl:min-h-0 xl:gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <Sidebar products={products} selectedProduct={selectedProduct} onSelect={selectProduct} />

        <main className="space-y-3 overflow-visible pr-0 xl:min-h-0 xl:space-y-4 xl:overflow-y-auto xl:pr-1 xl:scrollbar-thin">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[28px] p-4 sm:rounded-[32px] sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="panel-eyebrow">Customizer Workspace</span>
                  <span className="status-pill rounded-full px-2.5 py-1 text-[11px]">Live</span>
                </div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Build clean, production-ready product previews.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                  Pick a synced garment image, upload artwork, adjust placement, and render the final output inside the same focused dashboard.
                </p>
              </div>
              {selectedProduct?.views?.length ? (
                <ViewTabs views={selectedProduct.views} selectedView={selectedView} onChange={setSelectedView} />
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="soft-card rounded-[24px] p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Icon size={16} className="text-sky-300" />
                      <p>{item.label}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-50">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">Workspace status</p>
                  </div>
                );
              })}
            </div>

            {combinedError && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <AlertCircle size={18} />
                <span>{combinedError}</span>
              </div>
            )}
          </motion.section>

          <ProductPreview
            product={selectedProduct}
            view={displayView}
            uploadedPreview={previewUrl}
            controls={controls}
            result={activeResult}
            isRendering={isRendering}
            onZoomChange={(value) => setControls((current) => ({ ...current, zoom: value }))}
            onXChange={(value) => setControls((current) => ({ ...current, offsetX: value }))}
            onYChange={(value) => setControls((current) => ({ ...current, offsetY: value }))}
            onSizeChange={(value) => setControls((current) => ({ ...current, printSize: value }))}
          />
        </main>

        <div className="flex flex-col gap-3 overflow-visible pr-0 xl:min-h-0 xl:gap-4 xl:overflow-y-auto xl:pr-1 xl:scrollbar-thin">
          <div className="order-1">
            <UploadPanel
            file={file}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onSubmit={handleSubmit}
            disabled={!selectedProduct || !selectedView || !file || isRendering}
            job={job}
            selectedProductName={selectedProduct?.name}
            selectedViewName={selectedView?.name}
          />
          </div>
          <div className="order-2">
            <LivePreviewPanel result={activeResult} error={combinedError} job={job} onDownload={handleDownload} />
          </div>
          <div className="order-3 xl:order-3">
            <MaskAdjustPanel
            draftArea={mappingDraft}
            maxWidth={selectedViewWidth}
            maxHeight={selectedViewHeight}
            saving={savingMask}
            onChange={handleMaskFieldChange}
            onReset={handleMaskReset}
            onSave={handleMaskSave}
          />
          </div>
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/70 px-8 py-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400" />
            <p className="text-sm text-slate-200">Loading product catalog...</p>
          </div>
        </div>
      )}
    </div>
  );
}
