import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, Star } from "lucide-react";

export default function FelicitationModal({ targetUser, senderUser, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const TEMPLATES = [
    "Bravo pour tes efforts ! Continue comme ça, tu es sur la bonne voie pour réussir ton BTS Banque ! 🎉",
    "Excellent travail ! Tes révisions portent leurs fruits, garde ce rythme jusqu'à l'examen ! 🏆",
    "Tu progresses vraiment bien ! Chaque notion maîtrisée te rapproche de ton bac+2. Fier(e) de toi ! ⭐",
    "Félicitations pour ta régularité ! La constance dans les révisions, c'est la clé du succès ! 💪",
  ];

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    await base44.entities.Felicitation.create({
      toUserId: targetUser.id,
      toUserEmail: targetUser.email,
      toUserName: targetUser.full_name || targetUser.email,
      fromName: senderUser.full_name || senderUser.email,
      fromEmail: senderUser.email,
      message: message.trim(),
      seen: false,
    });
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <div className="font-display font-bold text-stone-900 text-sm">Envoyer des félicitations</div>
              <div className="text-xs text-stone-400">à {targetUser.full_name || targetUser.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100"><X className="w-4 h-4 text-stone-500" /></button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-green-600">Félicitations envoyées !</div>
            <div className="text-xs text-stone-400 mt-1">{targetUser.full_name} sera notifié(e) à sa prochaine connexion.</div>
          </div>
        ) : (
          <>
            {/* Templates rapides */}
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Messages rapides</div>
              <div className="space-y-1.5">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(t)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all ${message === t ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-stone-200 hover:border-yellow-300 hover:bg-yellow-50 text-stone-600"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Message personnalisé */}
            <div className="mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">Ou écris un message personnalisé</div>
              <textarea
                className="w-full rounded-xl border-2 border-stone-200 focus:border-yellow-400 px-3 py-2 text-sm resize-none min-h-[80px] focus:outline-none"
                placeholder="Écris ton message de félicitations…"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-100">Annuler</button>
              <button
                onClick={send}
                disabled={!message.trim() || sending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-sm disabled:opacity-40 transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}