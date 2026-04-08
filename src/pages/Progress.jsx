import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import { base44 } from "@/api/base44Client";

function StatCard({ label, value, sub, highlight, trend }) {
  const trendIcon =
    trend === null || trend === undefined ? null : trend < 0 ? (
      <TrendingDown className="w-3.5 h-3.5 text-green-500" />
    ) : trend > 0 ? (
      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
    ) : (
      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
    );

  return (
    <div className={`rounded-2xl border p-3 text-center ${highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-xl font-extrabold mt-0.5 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      <div className="flex items-center justify-center gap-1">
        {trendIcon}
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = await base44.auth.me();
    const data = await base44.entities.DailyLog.filter({ created_by: user.email }, "date");
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const weightData = logs
    .filter((item) => item.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({ date: format(parseISO(item.date), "M/d"), weight: item.weight }));

  const firstWeight = weightData[0]?.weight;
  const lastWeight = weightData[weightData.length - 1]?.weight;
  const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : null;
  const lowestWeight = weightData.length ? Math.min(...weightData.map((item) => item.weight)) : null;
  const highestWeight = weightData.length ? Math.max(...weightData.map((item) => item.weight)) : null;

  return (
    <PullToRefresh onRefresh={load}>
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Progress</h1>
        <p className="text-sm text-muted-foreground mb-6">Your weight journey</p>

        {weightData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">No weight data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Log your weight from the Today tab.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="Starting" value={firstWeight ? `${firstWeight}` : "—"} sub="lbs" />
              <StatCard label="Current" value={lastWeight ? `${lastWeight}` : "—"} sub="lbs" highlight />
              <StatCard
                label="Change"
                value={weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}` : "—"}
                sub="lbs"
                trend={weightChange}
              />
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 mb-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Weight Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weightData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "12px",
                      fontWeight: "600",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                    formatter={(val) => [`${val} lbs`, "Weight"]}
                  />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">Lowest</p>
                <p className="text-xl font-extrabold text-foreground">{lowestWeight} <span className="text-sm font-semibold text-muted-foreground">lbs</span></p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">Highest</p>
                <p className="text-xl font-extrabold text-foreground">{highestWeight} <span className="text-sm font-semibold text-muted-foreground">lbs</span></p>
              </div>
            </div>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
