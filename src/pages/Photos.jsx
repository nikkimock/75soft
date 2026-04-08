import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function Photos() {
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const load = async () => {
    const user = await base44.auth.me();
    const data = await base44.entities.DailyLog.filter({ created_by: user.email }, "-date", 100);
    setLogs(data.filter((item) => item.progress_photo));
    setTodayLog(data.find((item) => item.date === today) || null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    if (todayLog) {
      await base44.entities.DailyLog.update(todayLog.id, { progress_photo: file_url });
    } else {
      await base44.entities.DailyLog.create({
        date: today,
        followed_diet: false,
        exercise_outdoor: false,
        exercise_any: false,
        drank_water: false,
        water_glasses: 0,
        read_pages: false,
        progress_photo: file_url,
      });
    }

    await load();
    setUploading(false);
    toast.success("Today's photo saved");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const hasTodayPhoto = todayLog?.progress_photo;

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Photos</h1>
      <p className="text-sm text-muted-foreground mb-4">Daily progress photos</p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 mb-6 transition-all ${
          hasTodayPhoto ? "bg-green-50 border-green-200" : "bg-rose-50 border-rose-200 border-dashed"
        }`}
      >
        {hasTodayPhoto ? (
          <>
            <img src={hasTodayPhoto} alt="Today" className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-green-700">Today&apos;s photo saved</p>
              <p className="text-xs text-green-600">Tap to retake</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center">
              {uploading ? <div className="w-5 h-5 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" /> : <Camera className="w-6 h-6 text-rose-500" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-rose-600">No photo for today yet</p>
              <p className="text-xs text-rose-400">Tap to upload your daily photo</p>
            </div>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </>
        )}
      </motion.button>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" capture="environment" />

      {logs.length === 0 && !hasTodayPhoto ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No photos yet. Start today.</p>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-bold text-foreground mb-3">All Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {logs.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all relative"
              >
                <img src={item.progress_photo} alt="" className="w-full h-full object-cover" />
                {item.date === today && <div className="absolute bottom-1 right-1 bg-primary rounded-full w-3 h-3" />}
              </button>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <button className="absolute top-6 right-6 text-white">
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selected.progress_photo}
              alt=""
              className="max-w-full max-h-[70vh] rounded-2xl object-contain"
            />
            <p className="text-white text-sm font-bold mt-4">{format(parseISO(selected.date), "MMMM d, yyyy")}</p>
            {selected.weight && <p className="text-white/60 text-xs mt-1">{selected.weight} lbs</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
