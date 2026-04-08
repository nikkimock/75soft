import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 0) startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
  };

  const handleTouchEnd = async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  };

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
            style={{ paddingTop: refreshing ? 12 : Math.max(pullY - 32, 0) }}
          >
            <div className="w-8 h-8 rounded-full bg-card border border-border shadow flex items-center justify-center">
              <RefreshCw
                className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`}
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ y: refreshing ? THRESHOLD * 0.6 : pullY > 0 ? pullY * 0.6 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
