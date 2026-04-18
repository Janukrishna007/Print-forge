import { motion } from "framer-motion";
import { FlipHorizontal2, GalleryHorizontalEnd, PanelsTopLeft } from "lucide-react";

const labels = {
  front: "Front",
  back: "Back",
  side: "Side",
};

const icons = {
  front: PanelsTopLeft,
  back: FlipHorizontal2,
  side: GalleryHorizontalEnd,
};

export default function ViewTabs({ views, selectedView, onChange }) {
  return (
    <div className="grid w-full grid-cols-3 rounded-[24px] border border-white/10 bg-slate-950/55 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:inline-flex sm:w-auto sm:rounded-full">
      {views.map((view) => {
        const active = selectedView?.id === view.id;
        const Icon = icons[view.name] ?? PanelsTopLeft;
        return (
          <motion.button
            key={view.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(view)}
            className={`relative flex min-w-0 items-center justify-center gap-2 rounded-[18px] px-3 py-2 text-sm font-medium transition sm:rounded-full sm:px-4 sm:py-2.5 ${
              active ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="active-view-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-blue-700"
              />
            )}
            <Icon size={16} className="relative z-10" />
            <span className="relative z-10">{labels[view.name] ?? view.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
