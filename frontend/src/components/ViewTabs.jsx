import { motion } from "framer-motion";

const labels = {
  front: "Front",
  back: "Back",
  side: "Side",
};

export default function ViewTabs({ views, selectedView, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-slate-900/50 p-1">
      {views.map((view) => {
        const active = selectedView?.id === view.id;
        return (
          <motion.button
            key={view.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(view)}
            className={`relative rounded-full px-5 py-2 text-sm font-medium transition ${
              active ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="active-view-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              />
            )}
            <span className="relative z-10">{labels[view.name] ?? view.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
