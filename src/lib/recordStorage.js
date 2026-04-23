/**
 * Gère la sauvegarde des records (meilleurs scores) en BDD pour les utilisateurs connectés.
 * Fallback sur localStorage pour les utilisateurs non connectés.
 * 
 * Structure BDD : entité StudentProgress avec toolUsed="record_xxx", score = valeur record
 */
import { base44 } from "@/api/base44Client";

// ── LocalStorage fallback ──────────────────────────────────────────────────

export function lsGet(key, defaultVal = 0) {
  try { return JSON.parse(localStorage.getItem(key) ?? null) ?? defaultVal; } catch { return defaultVal; }
}
export function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Sauvegarde record en BDD (silencieux) ─────────────────────────────────

/**
 * Sauvegarde un record en BDD si c'est un nouveau record.
 * @param {string} recordKey - clé unique ex: "infini_VOJES" ou "pareto_VOJES_Chapitre 1"
 * @param {number} newValue  - nouvelle valeur
 * @param {number} currentBest - meilleur actuel (évite une lecture BDD supplémentaire)
 * @param {object} meta - { toolUsed, subject, chapter? }
 * @returns {number} le nouveau record (ou l'ancien si pas battu)
 */
export async function saveRecord(recordKey, newValue, currentBest, meta) {
  if (newValue <= currentBest) return currentBest;

  // Sauvegarde locale immédiate
  lsSet(`record_${recordKey}`, newValue);

  // Sauvegarde BDD silencieuse
  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return newValue;
    const me = await base44.auth.me();
    if (!me) return newValue;

    // Chercher un enregistrement existant pour ce record
    const existing = await base44.entities.StudentProgress.filter({
      userId: me.id,
      toolUsed: `record_${meta.toolUsed}`,
      subject: meta.subject || null,
      chapter: meta.chapter || null,
    }, null, 1);

    if (existing && existing.length > 0) {
      // Update seulement si nouveau record
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

/**
 * Charge le record depuis BDD (si connecté) ou localStorage.
 * @param {string} recordKey
 * @param {object} meta - { toolUsed, subject, chapter? }
 */
export async function loadRecord(recordKey, meta) {
  // D'abord localStorage
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
      // Sync local si BDD est meilleur
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