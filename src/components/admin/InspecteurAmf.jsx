import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, ShieldX } from "lucide-react";

const SITUATIONS = [
  {
    id: 1,
    situation: "\"Bonjour Monsieur le client, j'ai eu un soupçon de blanchiment sur votre compte, donc j'ai bloqué l'opération et prévenu TRACFIN.\"",
    verdict: "SANCTION",
    explication: "🚫 INTERDIT ! Il est strictement interdit d'informer le client qu'une déclaration de soupçon a été faite à TRACFIN. C'est le délit de 'tipping off', passible de sanctions pénales.",
  },
  {
    id: 2,
    situation: "\"Un client demande à retirer 8 000 € en espèces. Je lui demande l'objet de ce retrait et je documente le dossier.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Tout retrait important d'espèces doit faire l'objet d'une vigilance renforcée. Demander l'objet et documenter est une bonne pratique LCB-FT.",
  },
  {
    id: 3,
    situation: "\"Mon client est un PEP (Personne Politiquement Exposée). Je lui applique les mêmes procédures qu'à n'importe quel client.\"",
    verdict: "SANCTION",
    explication: "🚫 FAUTE ! Les PEP sont soumis à une vigilance renforcée obligatoire : identification systématique, approbation de la hiérarchie et surveillance accrue des opérations.",
  },
  {
    id: 4,
    situation: "\"Un client me présente un extrait Kbis de moins de 3 mois pour ouvrir un compte professionnel. Je l'accepte comme justificatif.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! L'extrait Kbis récent (moins de 3 mois) est un document d'identification valide pour une personne morale dans le cadre des obligations KYC.",
  },
  {
    id: 5,
    situation: "\"Un client souhaite racheter son assurance-vie avant 8 ans. Je lui explique les conséquences fiscales sans lui recommander de le faire.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Le devoir de conseil impose d'informer le client des conséquences de ses actes. Informer sans influencer est la bonne posture.",
  },
  {
    id: 6,
    situation: "\"Je vends à un client retraité, peu versé dans la finance, un produit de bourse à effet de levier x10 car il offre un bon rendement potentiel.\"",
    verdict: "SANCTION",
    explication: "🚫 INADAPTÉ ! Le profil de risque du client doit primer. Proposer un produit très risqué à un investisseur non averti constitue un manquement grave au devoir de conseil (MIF II).",
  },
  {
    id: 7,
    situation: "\"Un client en surendettement vient me voir. Je ne lui propose aucun nouveau crédit et l'oriente vers un conseiller spécialisé.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Face à une situation de surendettement, refuser d'aggraver la situation et orienter le client est conforme aux obligations de responsabilité bancaire.",
  },
  {
    id: 8,
    situation: "\"Lors d'une entrée en relation, le client ne peut pas justifier son adresse. J'ouvre quand même le compte car il semble de bonne foi.\"",
    verdict: "SANCTION",
    explication: "🚫 INTERDIT ! L'entrée en relation est impossible sans tous les justificatifs réglementaires. La 'bonne foi' ne dispense pas des obligations KYC.",
  },
  {
    id: 9,
    situation: "\"Je reçois un virement d'un pays figurant sur la liste GAFI des pays à risque. Je renforce la vigilance et documente l'opération.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Les opérations en provenance de pays à risque GAFI nécessitent une vigilance renforcée systématique et une documentation rigoureuse.",
  },
  {
    id: 10,
    situation: "\"Mon client me demande de lui confirmer par email qu'aucune procédure judiciaire n'est engagée contre lui par la banque. Je lui réponds par email.\"",
    verdict: "SANCTION",
    explication: "🚫 ATTENTION ! Confirmer l'absence de procédure peut constituer une violation du secret bancaire ou interférer avec une enquête en cours. Toujours consulter la hiérarchie.",
  },
  {
    id: 11,
    situation: "\"Un client m'apporte 15 000 € en espèces pour alimenter son compte. Je déclare l'opération en TRACFIN sans en informer le client.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! La déclaration de soupçon se fait en secret total. Ne pas informer le client est une obligation légale (no tipping off).",
  },
  {
    id: 12,
    situation: "\"Je propose à mon client un contrat d'assurance-vie en lui précisant uniquement les avantages fiscaux, sans mentionner les frais ni les risques.\"",
    verdict: "SANCTION",
    explication: "🚫 INCOMPLET ! L'information précontractuelle doit être complète, loyale et non trompeuse. Omettre les frais et les risques constitue un manquement au devoir d'information.",
  },
  {
    id: 13,
    situation: "\"Un client réalise plusieurs opérations de change en dessous du seuil de 10 000 € sur la même journée. Je suis vigilant et documente ce comportement.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Le 'smurfing' (fractionnement intentionnel sous les seuils) est un signal d'alerte LCB-FT. La vigilance et la documentation sont obligatoires.",
  },
  {
    id: 14,
    situation: "\"Mon client me donne procuration à une tierce personne. Je vérifie l'identité du mandataire et l'authenticité de la procuration.\"",
    verdict: "CONFORME",
    explication: "✅ CORRECT ! Le mandataire doit être identifié avec la même rigueur que le titulaire du compte. Vérifier la procuration est une obligation KYC.",
  },
  {
    id: 15,
    situation: "\"Un conseiller concurrent me propose de partager des informations client contre rémunération. J'accepte car les données sont anonymisées.\"",
    verdict: "SANCTION",
    explication: "🚫 GRAVE ! Le partage de données clients, même anonymisées, avec un tiers concurrent sans consentement explicite viole le RGPD et le secret bancaire. Sanction pénale possible.",
  },
];

export default function InspecteurAmf({ onClose }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(null); // null | "CONFORME" | "SANCTION"
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const situation = SITUATIONS[index];
  const total = SITUATIONS.length;

  const handleAnswer = (choice) => {
    if (answered !== null) return;
    const correct = choice === situation.verdict;
    if (correct) setScore(s => s + 1);
    setAnswered(choice);
  };

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
      setAnswered(null);
    }
  };

  const restart = () => {
    setIndex(0);
    setAnswered(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-3xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-yellow-400 font-bold text-xs uppercase tracking-widest mb-0.5">🕵️ Mode Inspecteur AMF</div>
            <div className="text-white font-display text-lg font-bold">Conforme ou Sanction ?</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6">
          {finished ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
              <div className="text-5xl mb-3">{score >= 12 ? "🏆" : score >= 9 ? "⚖️" : "📚"}</div>
              <h3 className="font-display text-2xl font-bold text-stone-900 mb-1">
                {score >= 12 ? "Inspecteur d'élite !" : score >= 9 ? "Bon inspecteur !" : "À retravailler !"}
              </h3>
              <p className="text-stone-500 mb-6">Score : <span className="font-bold text-slate-800 text-2xl">{score}</span> / {total}</p>
              <button
                onClick={restart}
                className="w-full py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Rejouer
              </button>
            </motion.div>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-stone-400 mb-1.5">
                  <span>Situation {index + 1} / {total}</span>
                  <span>✅ {score} correct{score > 1 ? "s" : ""}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full transition-all duration-500" style={{ width: `${((index) / total) * 100}%` }} />
                </div>
              </div>

              {/* Situation card */}
              <AnimatePresence mode="wait">
                <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">📋 Le banquier déclare :</div>
                    <p className="text-stone-800 font-medium leading-relaxed text-sm italic">{situation.situation}</p>
                  </div>

                  {/* Buttons */}
                  {answered === null ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAnswer("CONFORME")}
                        className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-green-50 border-2 border-green-200 hover:bg-green-100 hover:border-green-400 transition-all font-bold text-green-700"
                      >
                        <ShieldCheck className="w-7 h-7" />
                        <span className="text-sm">CONFORME</span>
                      </button>
                      <button
                        onClick={() => handleAnswer("SANCTION")}
                        className="flex flex-col items-center gap-2 py-5 rounded-2xl bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-400 transition-all font-bold text-red-700"
                      >
                        <ShieldX className="w-7 h-7" />
                        <span className="text-sm">SANCTION !</span>
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      {/* Verdict */}
                      <div className={`rounded-2xl p-4 mb-4 border-2 ${answered === situation.verdict ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
                        <div className={`font-bold text-sm mb-1 ${answered === situation.verdict ? "text-green-700" : "text-red-700"}`}>
                          {answered === situation.verdict ? "✅ Bien jugé, Inspecteur !" : "❌ Erreur de jugement !"}
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">{situation.explication}</p>
                      </div>
                      <button
                        onClick={next}
                        className="w-full py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                      >
                        {index + 1 < total ? "Situation suivante →" : "Voir le résultat"}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}