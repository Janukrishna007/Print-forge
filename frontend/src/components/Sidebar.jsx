import { motion } from "framer-motion";
import { Badge, LayoutPanelTop, Package, ShoppingBag, Shirt } from "lucide-react";

const categoryLabels = {
  tshirts: "T-Shirts",
  hoodies: "Hoodies",
  caps: "Caps",
  totes: "Totes",
};

const categoryIcons = {
  tshirts: Shirt,
  hoodies: Package,
  caps: Badge,
  totes: ShoppingBag,
};

export default function Sidebar({ products, selectedProduct, onSelect }) {
  const grouped = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <aside className="glass-panel flex flex-col rounded-[24px] p-4 sm:rounded-[28px] sm:p-5 xl:h-full xl:min-h-0">
      <div className="mb-5 shrink-0 sm:mb-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <LayoutPanelTop size={20} />
            </div>
            <div>
              <p className="panel-eyebrow">Step 1 Choose Product</p>
              <p className="mt-1 text-sm text-slate-400">Catalog console</p>
            </div>
          </div>
          <div className="status-pill rounded-full px-3 py-1 text-xs">{products.length} items</div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Product Lab</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
          Start here on mobile: pick a product card, then use the view tabs in the next panel to continue the workflow.
        </p>
      </div>
      <div className="scrollbar-thin max-h-[38vh] space-y-5 overflow-y-auto pr-1 xl:min-h-0 xl:flex-1 xl:max-h-none">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                {(() => {
                  const Icon = categoryIcons[category] ?? Package;
                  return <Icon size={14} className="text-sky-300/80" />;
                })()}
                <span>{categoryLabels[category] ?? category}</span>
              </div>
              <span className="rounded-full border border-white/5 bg-slate-900/50 px-2.5 py-1 text-[11px] text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((product) => {
                const isActive = selectedProduct?.id === product.id;
                return (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    key={product.id}
                    onClick={() => onSelect(product.id)}
                    className={`w-full rounded-[22px] border px-3 py-3 text-left transition sm:rounded-[26px] sm:px-4 sm:py-4 ${
                      isActive
                        ? "border-sky-400/40 bg-[linear-gradient(180deg,rgba(14,165,233,0.16),rgba(15,23,42,0.86))] shadow-[0_0_0_1px_rgba(56,189,248,0.18)]"
                        : "soft-card hover:border-white/12 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-sky-300" : "bg-slate-600"}`} />
                          <p className="truncate font-medium text-slate-50">{product.name}</p>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400 sm:leading-6">{product.description}</p>
                      </div>
                      <span className="status-pill shrink-0 rounded-full px-3 py-1 text-xs">${product.base_price}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
