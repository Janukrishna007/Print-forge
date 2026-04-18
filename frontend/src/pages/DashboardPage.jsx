import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

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

  const stats = useMemo(
    () => [
      { label: "Product Views", value: selectedProduct?.views?.length ?? 0 },
      { label: "Render Progress", value: `${job?.progress ?? 0}%` },
      { label: "Blend Mode", value: "Soft Light" },
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

  return (
    <div className="h-screen overflow-hidden px-4 py-4 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid h-full max-w-[1680px] min-h-0 grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <Sidebar products={products} selectedProduct={selectedProduct} onSelect={selectProduct} />

        <main className="min-h-0 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[32px] p-6"
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customizer Workspace</p>
                <h2 className="mt-2 text-4xl font-semibold text-slate-50">Premium product mockups, rendered asynchronously.</h2>
              </div>
              {selectedProduct?.views?.length ? (
                <ViewTabs views={selectedProduct.views} selectedView={selectedView} onChange={setSelectedView} />
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/5 bg-slate-900/35 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">{item.value}</p>
                </div>
              ))}
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

        <div className="min-h-0 space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          <UploadPanel
            file={file}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onSubmit={handleSubmit}
            disabled={!selectedProduct || !selectedView || !file || isRendering}
            job={job}
          />
          <MaskAdjustPanel
            draftArea={mappingDraft}
            maxWidth={selectedViewWidth}
            maxHeight={selectedViewHeight}
            saving={savingMask}
            onChange={handleMaskFieldChange}
            onReset={handleMaskReset}
            onSave={handleMaskSave}
          />
          <LivePreviewPanel result={activeResult} error={combinedError} job={job} onDownload={handleDownload} />
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
