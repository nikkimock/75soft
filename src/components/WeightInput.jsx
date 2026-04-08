import { useState } from "react";
import { Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WeightInput({ currentWeight, onSave }) {
  const [weight, setWeight] = useState(currentWeight || "");
  const [editing, setEditing] = useState(!currentWeight);

  const handleSave = () => {
    if (weight) {
      onSave(parseFloat(weight));
      setEditing(false);
    }
  };

  if (!editing && currentWeight) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <Scale className="w-5 h-5 text-pink-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">{currentWeight} lbs</p>
          <p className="text-xs text-muted-foreground">Tap to update</p>
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-border">
      <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
        <Scale className="w-5 h-5 text-pink-600" />
      </div>
      <Input
        type="number"
        placeholder="Weight in lbs"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="border-0 bg-transparent text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Button size="sm" onClick={handleSave} className="rounded-xl shrink-0">
        Save
      </Button>
    </div>
  );
}
