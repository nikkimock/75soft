import { useState } from "react";
import { Trash2, AlertTriangle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const user = await base44.auth.me();
    const logs = await base44.entities.DailyLog.filter({ created_by: user.email });
    for (const log of logs) await base44.entities.DailyLog.delete(log.id);

    const groups = await base44.entities.ChallengeGroup.filter({ members: user.email });
    for (const group of groups) {
      const updatedMembers = group.members.filter((member) => member !== user.email);
      if (!updatedMembers.length) await base44.entities.ChallengeGroup.delete(group.id);
      else await base44.entities.ChallengeGroup.update(group.id, { members: updatedMembers });
    }

    toast.success("Your local demo data has been cleared");
    setDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your local demo data</p>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button onClick={() => setShowConfirm(true)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-destructive/5 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Delete local data</p>
            <p className="text-xs text-muted-foreground">Clear logs and photos on this device</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 w-full max-w-sm"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-extrabold text-foreground text-center mb-2">Delete local data?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                This clears all demo logs and photos stored in your browser.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowConfirm(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
