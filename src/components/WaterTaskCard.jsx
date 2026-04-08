import { motion } from "framer-motion";

const TOTAL = 8;

export default function WaterTaskCard({ glasses = 0, onUpdate }) {
  const complete = glasses >= TOTAL;

  const handleTap = (index) => {
    const next = glasses === index + 1 ? 0 : index + 1;
    onUpdate(next);
  };

  return (
    <div className={`w-full p-4 rounded-2xl border transition-all duration-200 ${complete ? "bg-accent/45 border-accent" : "bg-card border-border"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${complete ? "bg-accent" : "bg-cyan-100"}`}>
          {complete ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
              ✓
            </motion.span>
          ) : (
            "💧"
          )}
        </div>
        <div className="flex-1">
          <span className={`text-sm font-semibold ${complete ? "text-accent-foreground line-through opacity-75" : "text-foreground"}`}>
            Drink 8 glasses of water
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {glasses}/{TOTAL} glasses
          </p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const filled = i < glasses;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleTap(i)}
              className={`flex-1 h-7 rounded-lg transition-all duration-150 ${filled ? "bg-cyan-400 shadow-sm" : "bg-muted border border-border"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
