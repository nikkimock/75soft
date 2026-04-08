import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import DayCounter from "@/components/DayCounter";
import TaskCard from "@/components/TaskCard";
import WeightInput from "@/components/WeightInput";
import PhotoUpload from "@/components/PhotoUpload";
import WaterTaskCard from "@/components/WaterTaskCard";
import PullToRefresh from "@/components/PullToRefresh";

function isPerfectDay(log) {
  return Boolean(
    log &&
      log.followed_diet &&
      log.exercise_any &&
      log.drank_water &&
      log.read_pages &&
      log.progress_photo
  );
}

export default function Dashboard() {
  const [log, setLog] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  const loadData = useCallback(async () => {
    const user = await base44.auth.me();
    const logs = await base44.entities.DailyLog.filter({ created_by: user.email }, "-date");
    setAllLogs(logs);
    setLog(logs.find((item) => item.date === today) || null);

    const groups = await base44.entities.ChallengeGroup.filter({ members: user.email });
    setGroup(groups[0] || null);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateLog = async (updates) => {
    if (log?.id) {
      setLog({ ...log, ...updates });
      await base44.entities.DailyLog.update(log.id, updates);
      await loadData();
      return;
    }

    await base44.entities.DailyLog.create({
      date: today,
      followed_diet: false,
      exercise_outdoor: false,
      exercise_any: false,
      drank_water: false,
      water_glasses: 0,
      read_pages: false,
      progress_photo: "",
      group_id: group?.id || "",
      ...updates,
    });
    await loadData();
  };

  const completedDays = allLogs.filter(isPerfectDay).length;
  const allDone = isPerfectDay(log);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">75 Soft</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>

        <DayCounter
          startDate={group?.start_date || allLogs[allLogs.length - 1]?.date || today}
          completedDays={completedDays}
        />

        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl bg-accent/45 border border-accent text-center"
          >
            <p className="text-sm font-bold text-accent-foreground">All tasks done today</p>
            <p className="text-xs text-muted-foreground mt-0.5">You&apos;re building real momentum.</p>
          </motion.div>
        )}

        <div className="space-y-2.5 mb-4">
          <TaskCard taskKey="followed_diet" checked={Boolean(log?.followed_diet)} onToggle={() => updateLog({ followed_diet: !log?.followed_diet })} />
          <TaskCard taskKey="exercise_any" checked={Boolean(log?.exercise_any)} onToggle={() => updateLog({ exercise_any: !log?.exercise_any })} />
          <TaskCard taskKey="read_pages" checked={Boolean(log?.read_pages)} onToggle={() => updateLog({ read_pages: !log?.read_pages })} />
          <WaterTaskCard glasses={log?.water_glasses || 0} onUpdate={(water_glasses) => updateLog({ water_glasses, drank_water: water_glasses >= 8 })} />
        </div>

        <div className="space-y-2.5 pb-6">
          <WeightInput currentWeight={log?.weight} onSave={(weight) => updateLog({ weight })} />
          <PhotoUpload photoUrl={log?.progress_photo} onUpload={(progress_photo) => updateLog({ progress_photo })} />
        </div>
      </div>
    </PullToRefresh>
  );
}
