import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Auth : admin only (ou appel depuis automation)
  let isAutomation = false;
  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    // Peut être appelé par une automation (sans user token) — on continue
    isAutomation = true;
  }

  // 1. Récupérer tous les utilisateurs de rôle "user"
  const allUsers = await base44.asServiceRole.entities.User.list();
  const students = allUsers.filter(u => u.role === 'user' && u.email);

  if (students.length === 0) {
    return Response.json({ sent: 0, message: 'Aucun étudiant trouvé' });
  }

  // 2. Récupérer des questions de révision aléatoires (3 VOJES + 3 CESBF)
  const [vojQuestions, cesbfQuestions] = await Promise.all([
    base44.asServiceRole.entities.RevisionQuestion.filter({ subject: 'VOJES' }, null, 100),
    base44.asServiceRole.entities.RevisionQuestion.filter({ subject: 'CESBF' }, null, 100),
  ]);

  const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  const vojPick = pick(vojQuestions, 3);
  const cesbfPick = pick(cesbfQuestions, 3);

  // 3. Construire le corps de l'email HTML
  const buildQuestionBlock = (q, idx) => `
    <div style="background:#f8f9fa;border-left:4px solid #4ade80;border-radius:8px;padding:16px;margin-bottom:12px;">
      <p style="margin:0 0 6px 0;font-weight:700;color:#1a1a1a;">❓ ${idx + 1}. ${q.question}</p>
      ${q.chapter ? `<p style="margin:0;font-size:12px;color:#888;">📂 ${q.chapter}</p>` : ''}
    </div>
  `;

  const vojHtml = vojPick.length > 0 ? `
    <h3 style="color:#7c3aed;margin:24px 0 10px 0;">📊 VOJES</h3>
    ${vojPick.map((q, i) => buildQuestionBlock(q, i)).join('')}
  ` : '';

  const cesbfHtml = cesbfPick.length > 0 ? `
    <h3 style="color:#ea580c;margin:24px 0 10px 0;">🏦 CESBF</h3>
    ${cesbfPick.map((q, i) => buildQuestionBlock(q, i)).join('')}
  ` : '';

  const emailBody = `
    <div style="font-family:'Nunito',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <div style="background:linear-gradient(135deg,#4ade80,#22c55e);padding:32px 24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:28px;font-weight:800;">🎯 Rappel hebdomadaire</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:15px;">BTS Banque — Questions de révision de la semaine</p>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <p style="font-size:16px;color:#444;line-height:1.6;">Bonjour 👋<br>Voici ta sélection de questions pour réviser cette semaine. Prends 10 minutes pour y réfléchir avant de vérifier les réponses sur l'application !</p>

        ${vojHtml}
        ${cesbfHtml}

        <div style="text-align:center;margin-top:32px;">
          <a href="https://www.app.base44.com" style="display:inline-block;background:#4ade80;color:white;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;border-bottom:4px solid #16a34a;">
            ✨ Réviser maintenant →
          </a>
        </div>

        <p style="text-align:center;color:#aaa;font-size:12px;margin-top:24px;">
          Tu reçois cet email car tu es inscrit(e) sur la plateforme BTS Banque.<br>
          <em>Bon courage pour tes révisions ! 💪</em>
        </p>
      </div>
    </div>
  `;

  // 4. Envoyer l'email à chaque étudiant
  let sent = 0;
  const errors = [];

  for (const student of students) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: student.email,
        from_name: 'BTS Banque — Révision',
        subject: '🎯 Tes questions de révision de la semaine !',
        body: emailBody,
      });
      sent++;
    } catch (e) {
      errors.push({ email: student.email, error: e.message });
    }
  }

  return Response.json({
    sent,
    total: students.length,
    errors: errors.length > 0 ? errors : undefined,
    message: `Email envoyé à ${sent}/${students.length} étudiants`,
  });
});