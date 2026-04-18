import { motion } from "framer-motion";

const categoryLabels = {
  tshirts: "T-Shirts",
  hoodies: "Hoodies",
  caps: "Caps",
  totes: "Totes",
};

export default function Sidebar({ products, selectedProduct, onSelect }) {
  const grouped = products.reduce((acc, product) => {
    acc[product.category] = acc[product.category] || [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <aside className="glass-panel flex h-full min-h-0 flex-col rounded-[28px] p-5">
      <div className="mb-6 shrink-0">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">PrintForge</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">Product Lab</h1>
        <p className="mt-3 text-sm text-slate-400">Curate premium mockups and launch render-ready product campaigns.</p>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-slate-500">{categoryLabels[category] ?? category}</p>
            <div className="space-y-2">
              {items.map((product) => {
                const isActive = selectedProduct?.id === product.id;
                return (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    key={product.id}
                    onClick={() => onSelect(product.id)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-blue-400/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-slate-900/35 hover:border-white/10 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-50">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{product.description}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">${product.base_price}</span>
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
