import {
  clearCurrentUser,
  createGroup,
  createLog,
  deleteGroup,
  deleteLog,
  getCurrentUser,
  getGroups,
  getLogs,
  saveGroups,
  saveLogs,
  updateGroup,
  upsertLog,
} from "@/lib/local-store";

function sortRecords(records, sort) {
  if (!sort) return [...records];
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (left === right) return 0;
    return descending ? (left < right ? 1 : -1) : left < right ? -1 : 1;
  });
}

function matchesFilter(record, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (Array.isArray(record[key])) return record[key].includes(value);
    return record[key] === value;
  });
}

function makeEntityStore(type) {
  const read = () => (type === "DailyLog" ? getLogs() : getGroups());

  return {
    async filter(filter = {}, sort, limit) {
      const records = read().filter((record) => matchesFilter(record, filter));
      const sorted = sortRecords(records, sort);
      return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
    },
    async create(payload) {
      return type === "DailyLog" ? createLog(payload) : createGroup(payload);
    },
    async update(id, updates) {
      if (type === "DailyLog") {
        const current = read().find((item) => item.id === id);
        if (!current) throw new Error("Log not found");
        return upsertLog({ ...current, ...updates });
      }
      return updateGroup(id, updates);
    },
    async delete(id) {
      if (type === "DailyLog") deleteLog(id);
      else deleteGroup(id);
    },
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export const base44 = {
  auth: {
    async me() {
      return getCurrentUser();
    },
    logout() {
      clearCurrentUser();
      if (typeof window !== "undefined") window.location.href = "/";
    },
    redirectToLogin() {
      if (typeof window !== "undefined") {
        window.alert("This standalone version uses a demo account automatically.");
      }
    },
  },
  entities: {
    DailyLog: makeEntityStore("DailyLog"),
    ChallengeGroup: makeEntityStore("ChallengeGroup"),
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const file_url = await fileToDataUrl(file);
        return { file_url };
      },
    },
  },
};
