/**
 * Utilitaire centralisé pour enregistrer la progression des élèves dans StudentProgress.
 * Appel silencieux : ne bloque jamais l'UI même si ça échoue.
 */
import { base44 } from "@/api/base44Client";

export async function trackProgress({ toolUsed, subject, score, totalQuestions, chapter }) {
  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return;
    const me = await base44.auth.me();
    if (!me) return;

    await base44.entities.StudentProgress.create({
      userId: me.id,
      userEmail: me.email,
      toolUsed,
      subject: subject || null,
      score: score ?? null,
      totalQuestions: totalQuestions ?? null,
      chapter: chapter || null,
      sessionDate: new Date().toISOString(),
    });

    // Met aussi à jour user.toolsUsed
    const tools = Array.isArray(me.toolsUsed) ? me.toolsUsed : [];
    if (!tools.includes(toolUsed)) {
      await base44.auth.updateMe({ toolsUsed: [...tools, toolUsed] });
    }
  } catch {
    // silencieux
  }
}