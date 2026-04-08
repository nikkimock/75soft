import { Check } from "lucide-react";
import { motion } from "framer-motion";

const taskConfig = {
  followed_diet: { label: "Follow a diet", emoji: "🥗", color: "bg-green-100" },
  exercise_any: { label: "45 min workout", emoji: "💪", color: "bg-sky-100" },
  read_pages: { label: "Read 10 pages", emoji: "📖", color: "bg-amber-100" },
  progress_photo: { label: "Take a progress photo", emoji: "📸", color: "bg-rose-100" },
};

export default function TaskCard({ taskKey, checked, onToggle }) {
  const config = taskConfig[taskKey];
  if (!config) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
        checked ? "bg-accent/45 border-accent" : "bg-card border-border hover:border-primary/35"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${checked ? "bg-accent" : config.color}`}>
        {checked ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
            <Check className="w-5 h-5 text-accent-foreground" strokeWidth={3} />
          </motion.div>
        ) : (
          <span>{config.emoji}</span>
        )}
      </div>
      <span className={`text-sm font-semibold flex-1 text-left ${checked ? "text-accent-foreground line-through opacity-75" : "text-foreground"}`}>
        {config.label}
      </span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checked ? "bg-accent border-accent" : "border-muted-foreground/30"}`}>
        {checked && <Check className="w-3.5 h-3.5 text-accent-foreground" strokeWidth={3} />}
      </div>
    </motion.button>
  );
}
