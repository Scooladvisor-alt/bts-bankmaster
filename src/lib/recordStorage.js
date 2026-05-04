/**
 * Gère la sauvegarde des records (meilleurs scores) en BDD pour les utilisateurs connectés.
 * Les clés localStorage incluent l'userId pour isoler la progression par compte.
 */
import { base44 } from "@/api/base44Client";

// ── Cache userId ───────────────────────────────────────────────────────────
let _cachedUserId = null;

export function getCachedUserId() { return _cachedUserId || "anonymous"; }

export async function initUserId() {
  try {
    const me = await base44.auth.me();
    _cachedUserId = me?.id || "anonymous";
  } catch { _cachedUserId = "anonymous"; }
  return _cachedUserId;
}

// ── LocalStorage helpers (clé inclut userId) ──────────────────────────────

export function lsGet(key, defaultVal = 0) {
  const uid = getCachedUserId();
  try { return JSON.parse(localStorage.getItem(`${key}_u${uid}`) ?? null) ?? defaultVal; } catch { return defaultVal; }
}

export function lsSet(key, val) {
  const uid = getCachedUserId();
  try { localStorage.setItem(`${key}_u${uid}`, JSON.stringify(val)); } catch {}
}

// ── Sauvegarde record en BDD (silencieux) ─────────────────────────────────

export async function saveRecord(recordKey, newValue, currentBest, meta) {
  if (newValue <= currentBest) return currentBest;

  lsSet(`record_${recordKey}`, newValue);

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return newValue;
    const me = await base44.auth.me();
    if (!me) return newValue;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: `record_${meta.toolUsed}`,
      subject: meta.subject || null,
      chapter: meta.chapter || null,
    }, null, 1);

    if (existing && existing.length > 0) {
      if (newValue > (existing[0].score || 0)) {
        await base44.entities.StudentProgress.update(existing[0].id, {
          score: newValue,
          sessionDate: new Date().toISOString(),
        });
      }
    } else {
      await base44.entities.StudentProgress.create({
        userId: me.id,
        userEmail: me.email,
        toolUsed: `record_${meta.toolUsed}`,
        subject: meta.subject || null,
        chapter: meta.chapter || null,
        score: newValue,
        totalQuestions: null,
        sessionDate: new Date().toISOString(),
      });
    }
  } catch { /* silencieux */ }

  return newValue;
}

export async function loadRecord(recordKey, meta) {
  const local = lsGet(`record_${recordKey}`, 0);

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return local;
    const me = await base44.auth.me();
    if (!me) return local;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: `record_${meta.toolUsed}`,
      subject: meta.subject || null,
      chapter: meta.chapter || null,
    }, null, 1);

    if (existing && existing.length > 0) {
      const dbVal = existing[0].score || 0;
      if (dbVal > local) lsSet(`record_${recordKey}`, dbVal);
      return Math.max(local, dbVal);
    }
  } catch { /* silencieux */ }

  return local;
}

// ── Helpers spécialisés ────────────────────────────────────────────────────

export async function saveInfiniRecordDB(subject, score, currentBest) {
  return saveRecord(`infini_${subject}`, score, currentBest, { toolUsed: "infini", subject });
}

export async function saveGameKmRecordDB(subject, km, currentBest) {
  return saveRecord(`jeu_${subject}`, Math.floor(km), currentBest, { toolUsed: "jeu", subject });
}

export async function saveParetoScoreDB(subject, chapter, percentage, currentBest) {
  return saveRecord(`pareto_${subject}_${chapter}`, percentage, currentBest, { toolUsed: "pareto", subject, chapter });
}

// ── AMF Progress ───────────────────────────────────────────────────────────

export async function saveAmfProgressDB(progress) {
  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return;
    const me = await base44.auth.me();
    if (!me) return;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: "record_amf",
    }, null, 1);

    const encoded = JSON.stringify(progress);
    const validated = Object.values(progress).filter(Boolean).length;

    if (existing && existing.length > 0) {
      await base44.entities.StudentProgress.update(existing[0].id, {
        score: validated,
        chapter: encoded,
        sessionDate: new Date().toISOString(),
      });
    } else {
      await base44.entities.StudentProgress.create({
        userId: me.id,
        userEmail: me.email,
        toolUsed: "record_amf",
        subject: "CESBF",
        score: validated,
        chapter: encoded,
        sessionDate: new Date().toISOString(),
      });
    }
  } catch { /* silencieux */ }
}

export async function loadAmfProgressDB() {
  const localRaw = localStorage.getItem(`amf_progress_u${getCachedUserId()}`);
  const local = localRaw ? JSON.parse(localRaw) : {};

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return local;
    const me = await base44.auth.me();
    if (!me) return local;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: "record_amf",
    }, null, 1);

    if (existing && existing.length > 0 && existing[0].chapter) {
      const dbProgress = JSON.parse(existing[0].chapter);
      const merged = { ...local };
      Object.keys(dbProgress).forEach(k => { if (dbProgress[k]) merged[k] = true; });
      localStorage.setItem(`amf_progress_u${me.id}`, JSON.stringify(merged));
      return merged;
    }
  } catch { /* silencieux */ }

  return local;
}

// ── Pareto scores (tous chapitres) depuis BDD ────────────────────────────

export async function loadAllParetoScoresDB(subject) {
  const uid = getCachedUserId();
  const localKey = `pareto_scores_${subject}_u${uid}`;
  const local = JSON.parse(localStorage.getItem(localKey) || "{}");

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return local;
    const me = await base44.auth.me();
    if (!me) return local;

    const records = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: "record_pareto",
      subject,
    }, null, 200);

    const merged = { ...local };
    (records || []).forEach(r => {
      if (r.chapter && r.score !== undefined) {
        if (!merged[r.chapter] || r.score > merged[r.chapter]) {
          merged[r.chapter] = r.score;
        }
      }
    });
    localStorage.setItem(localKey, JSON.stringify(merged));
    return merged;
  } catch { /* silencieux */ }

  return local;
}

// ── Infini record depuis BDD ─────────────────────────────────────────────

export async function loadInfiniRecordDB(subject) {
  const local = lsGet(`record_infini_${subject}`, 0);

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return local;
    const me = await base44.auth.me();
    if (!me) return local;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: "record_infini",
      subject,
    }, null, 1);

    if (existing && existing.length > 0) {
      const dbVal = existing[0].score || 0;
      if (dbVal > local) lsSet(`record_infini_${subject}`, dbVal);
      return Math.max(local, dbVal);
    }
  } catch { /* silencieux */ }

  return local;
}

// ── Game km record depuis BDD ─────────────────────────────────────────────

export async function loadGameKmRecordDB(subject) {
  const local = lsGet(`record_jeu_${subject}`, 0);

  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return local;
    const me = await base44.auth.me();
    if (!me) return local;

    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: "record_jeu",
      subject,
    }, null, 1);

    if (existing && existing.length > 0) {
      const dbVal = existing[0].score || 0;
      if (dbVal > local) lsSet(`record_jeu_${subject}`, dbVal);
      return Math.max(local, dbVal);
    }
  } catch { /* silencieux */ }

  return local;
}