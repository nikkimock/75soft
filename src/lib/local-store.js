const STORAGE_KEYS = {
  user: "75soft_user",
  logs: "75soft_logs",
  groups: "75soft_groups",
};

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${id}`;
}

function getSeedUser() {
  return {
    id: "user_demo",
    email: "demo@75soft.app",
    full_name: "Demo User",
    role: "member",
  };
}

function ensureSeeded() {
  if (!read(STORAGE_KEYS.user, null)) write(STORAGE_KEYS.user, getSeedUser());
  if (!read(STORAGE_KEYS.logs, null)) write(STORAGE_KEYS.logs, []);
  if (!read(STORAGE_KEYS.groups, null)) write(STORAGE_KEYS.groups, []);
}

export function getCurrentUser() {
  ensureSeeded();
  return read(STORAGE_KEYS.user, getSeedUser());
}

export function clearCurrentUser() {
  write(STORAGE_KEYS.user, getSeedUser());
}

export function getLogs() {
  ensureSeeded();
  return read(STORAGE_KEYS.logs, []);
}

export function saveLogs(logs) {
  write(STORAGE_KEYS.logs, logs);
}

export function getGroups() {
  ensureSeeded();
  return read(STORAGE_KEYS.groups, []);
}

export function saveGroups(groups) {
  write(STORAGE_KEYS.groups, groups);
}

export function upsertLog(log) {
  const logs = getLogs();
  const index = logs.findIndex((item) => item.id === log.id);
  const next = index >= 0 ? logs.map((item) => (item.id === log.id ? log : item)) : [log, ...logs];
  saveLogs(next);
  return log;
}

export function createLog(payload) {
  const user = getCurrentUser();
  const record = { id: generateId("log"), created_by: user.email, ...payload };
  upsertLog(record);
  return record;
}

export function createGroup(payload) {
  const groups = getGroups();
  const record = { id: generateId("group"), members: [], ...payload };
  saveGroups([record, ...groups]);
  return record;
}

export function updateGroup(id, updates) {
  const groups = getGroups();
  const record = groups.find((item) => item.id === id);
  if (!record) throw new Error("Group not found");
  const next = { ...record, ...updates };
  saveGroups(groups.map((item) => (item.id === id ? next : item)));
  return next;
}

export function deleteGroup(id) {
  saveGroups(getGroups().filter((item) => item.id !== id));
}

export function deleteLog(id) {
  saveLogs(getLogs().filter((item) => item.id !== id));
}
