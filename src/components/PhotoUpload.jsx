import { useRef } from "react";
import { Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function PhotoUpload({ photoUrl, onUpload, loading }) {
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(file_url);
    toast.success("Photo saved");
  };

  if (photoUrl) {
    return (
      <button onClick={() => fileRef.current?.click()} className="w-full rounded-2xl overflow-hidden border border-border relative group">
        <img src={photoUrl} alt="Progress" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </button>
    );
  }

  return (
    <button
      onClick={() => fileRef.current?.click()}
      disabled={loading}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-dashed border-primary/30 hover:border-primary/50 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
        <Camera className="w-5 h-5 text-rose-600" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">Add progress photo</p>
        <p className="text-xs text-muted-foreground">Required for a perfect day</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </button>
  );
}
