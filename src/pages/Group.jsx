import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Users, Copy, Plus, LogIn, Crown, Flame, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TASK_KEYS = ["followed_diet", "exercise_any", "drank_water", "read_pages", "progress_photo"];

function didCompleteDay(logs, email, dateStr) {
  const log = logs.find((item) => item.created_by === email && item.date === dateStr);
  return log ? TASK_KEYS.every((key) => Boolean(log[key])) : false;
}

function calculateGroupStreak(allLogs, members) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 75; i += 1) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const allCompleted = members.every((email) => didCompleteDay(allLogs, email, dateStr));
    if (!allCompleted) break;
    streak += 1;
  }
  return streak;
}

export default function Group() {
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [joinCode, setJoinCode] = useState("");
  const [memberData, setMemberData] = useState({});
  const [groupStreak, setGroupStreak] = useState(0);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const groups = await base44.entities.ChallengeGroup.filter({ members: me.email });
      const activeGroup = groups[0] || null;
      setGroup(activeGroup);
      if (activeGroup) await loadGroupData(activeGroup);
      setLoading(false);
    };
    load();
  }, []);

  const loadGroupData = async (activeGroup) => {
    const memberEmails = activeGroup.members || [];
    const allLogs = [];
    const statsByMember = {};

    for (const email of memberEmails) {
      const logs = await base44.entities.DailyLog.filter({ created_by: email }, "-date", 75);
      logs.forEach((log) => allLogs.push(log));
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const todayLog = logs.find((log) => log.date === todayStr);
      const todayDone = todayLog ? TASK_KEYS.filter((key) => Boolean(todayLog[key])).length : 0;
      const totalCompleted = logs.filter((log) => TASK_KEYS.every((key) => Boolean(log[key]))).length;
      statsByMember[email] = { todayDone, totalCompleted };
    }

    setMemberData(statsByMember);
    setGroupStreak(calculateGroupStreak(allLogs, memberEmails));
  };

  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGroup = async () => {
    if (!groupName.trim()) return;
    const created = await base44.entities.ChallengeGroup.create({
      name: groupName,
      start_date: startDate,
      invite_code: generateCode(),
      members: [user.email],
      owner_email: user.email,
    });
    setGroup(created);
    await loadGroupData(created);
    toast.success("Group created");
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    const groups = await base44.entities.ChallengeGroup.filter({ invite_code: joinCode.toUpperCase() });
    if (!groups.length) {
      toast.error("No group found with that code");
      return;
    }
    const activeGroup = groups[0];
    if (activeGroup.members.includes(user.email)) {
      setGroup(activeGroup);
      await loadGroupData(activeGroup);
      toast.info("You're already in this group");
      return;
    }
    const updated = await base44.entities.ChallengeGroup.update(activeGroup.id, {
      members: [...activeGroup.members, user.email],
    });
    setGroup(updated);
    await loadGroupData(updated);
    toast.success("Joined group");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(group.invite_code);
    toast.success("Invite code copied");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!group && !mode) {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Challenge Group</h1>
        <p className="text-sm text-muted-foreground mb-8">Do 75 Soft together</p>
        <div className="flex flex-col items-center py-12 gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-9 h-9 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-[240px]">
            Join a group challenge. A perfect day only counts when every member finishes all five habits.
          </p>
          <div className="flex gap-3 mt-4 w-full max-w-xs">
            <Button onClick={() => setMode("create")} className="flex-1 rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Create
            </Button>
            <Button variant="outline" onClick={() => setMode("join")} className="flex-1 rounded-xl gap-2">
              <LogIn className="w-4 h-4" /> Join
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!group && mode === "create") {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-foreground mb-6">Create Group</h1>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Group Name</label>
            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. The Glow Up Gang" className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setMode(null)} className="flex-1 rounded-xl">Back</Button>
            <Button onClick={createGroup} className="flex-1 rounded-xl">Create</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!group && mode === "join") {
    return (
      <div className="px-5 pt-6">
        <h1 className="text-2xl font-extrabold text-foreground mb-6">Join Group</h1>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Invite Code</label>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter 6-letter code"
              className="rounded-xl uppercase tracking-widest text-center text-lg font-bold"
              maxLength={6}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setMode(null)} className="flex-1 rounded-xl">Back</Button>
            <Button onClick={joinGroup} className="flex-1 rounded-xl">Join</Button>
          </div>
        </div>
      </div>
    );
  }

  const anyMissedToday = group.members?.some((email) => {
    const data = memberData[email];
    return !data || data.todayDone < TASK_KEYS.length;
  });

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-extrabold text-foreground">{group.name}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Started {format(new Date(group.start_date), "MMM d, yyyy")}</p>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-2xl p-5 mb-5 text-center ${groupStreak > 0 ? "bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20" : "bg-rose-50 border border-rose-200"}`}
      >
        {groupStreak > 0 ? (
          <>
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-1" />
            <p className="text-4xl font-extrabold text-foreground">{groupStreak}</p>
            <p className="text-sm font-semibold text-muted-foreground mt-0.5">day group streak</p>
          </>
        ) : (
          <>
            <RefreshCw className="w-8 h-8 text-rose-400 mx-auto mb-1" />
            <p className="text-4xl font-extrabold text-foreground">0</p>
            <p className="text-sm font-semibold text-rose-500 mt-0.5">streak reset</p>
          </>
        )}
      </motion.div>

      {anyMissedToday && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 text-center">Not everyone has finished today&apos;s tasks yet.</p>
        </div>
      )}

      <motion.button whileTap={{ scale: 0.97 }} onClick={copyCode} className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary border border-border mb-5">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Invite Code</p>
          <p className="text-xl font-extrabold tracking-[0.3em] text-primary">{group.invite_code}</p>
        </div>
        <Copy className="w-5 h-5 text-muted-foreground" />
      </motion.button>

      <h3 className="text-sm font-bold text-foreground mb-3">Members ({group.members?.length || 0})</h3>
      <div className="space-y-2 pb-6">
        {group.members?.map((email) => {
          const stats = memberData[email];
          const isOwner = email === group.owner_email;
          const isYou = email === user?.email;
          const doneFraction = stats ? `${stats.todayDone}/${TASK_KEYS.length}` : `0/${TASK_KEYS.length}`;
          const allDoneToday = stats?.todayDone === TASK_KEYS.length;

          return (
            <div key={email} className={`flex items-center gap-3 p-3 rounded-2xl border ${allDoneToday ? "bg-green-50 border-green-200" : "bg-card border-border"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${allDoneToday ? "bg-green-100" : "bg-primary/10"}`}>
                <span className={`text-sm font-bold ${allDoneToday ? "text-green-600" : "text-primary"}`}>{email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{isYou ? "You" : email.split("@")[0]}</p>
                  {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-muted-foreground">Today: {doneFraction} tasks · {stats?.totalCompleted || 0} perfect days</p>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${allDoneToday ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {allDoneToday ? "Done" : doneFraction}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
