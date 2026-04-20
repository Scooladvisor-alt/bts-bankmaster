const KEY = "bts_user_profile";
const TIME_KEY = "bts_user_time";

export function getLocalUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocalUser(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

// Time tracking
export function startTimeTracking() {
  try {
    const existing = getTimeData();
    existing.sessionStart = Date.now();
    localStorage.setItem(TIME_KEY, JSON.stringify(existing));
  } catch {}
}

export function stopTimeTracking() {
  try {
    const data = getTimeData();
    if (data.sessionStart) {
      const elapsed = Math.floor((Date.now() - data.sessionStart) / 1000);
      data.totalSeconds = (data.totalSeconds || 0) + elapsed;
      data.sessionStart = null;
      localStorage.setItem(TIME_KEY, JSON.stringify(data));
    }
  } catch {}
}

export function getTimeData() {
  try {
    const raw = localStorage.getItem(TIME_KEY);
    return raw ? JSON.parse(raw) : { totalSeconds: 0, sessionStart: null };
  } catch { return { totalSeconds: 0, sessionStart: null }; }
}

export function getTotalSeconds() {
  const data = getTimeData();
  const base = data.totalSeconds || 0;
  const live = data.sessionStart ? Math.floor((Date.now() - data.sessionStart) / 1000) : 0;
  return base + live;
}

// Admin: store all users seen
export function registerUserForAdmin(name) {
  try {
    const ADMIN_KEY = "bts_admin_users";
    const raw = localStorage.getItem(ADMIN_KEY);
    const users = raw ? JSON.parse(raw) : [];
    const existing = users.find(u => u.name === name);
    if (!existing) {
      users.push({ name, firstSeen: new Date().toISOString(), lastTool: null });
      localStorage.setItem(ADMIN_KEY, JSON.stringify(users));
    }
  } catch {}
}

export function updateUserLastTool(name, tool) {
  try {
    const ADMIN_KEY = "bts_admin_users";
    const raw = localStorage.getItem(ADMIN_KEY);
    const users = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex(u => u.name === name);
    if (idx >= 0) {
      users[idx].lastTool = tool;
      localStorage.setItem(ADMIN_KEY, JSON.stringify(users));
    }
  } catch {}
}

export function updateAdminUserTime(name, totalSeconds) {
  try {
    const ADMIN_KEY = "bts_admin_users";
    const raw = localStorage.getItem(ADMIN_KEY);
    const users = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex(u => u.name === name);
    if (idx >= 0) {
      users[idx].lastSeen = new Date().toISOString();
      localStorage.setItem(ADMIN_KEY, JSON.stringify(users));
    }
  } catch {}
}

export function getAdminUsers() {
  try {
    const ADMIN_KEY = "bts_admin_users";
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}