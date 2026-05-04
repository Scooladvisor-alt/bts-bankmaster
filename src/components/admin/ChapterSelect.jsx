import React from "react";

// Chapitres VOJES
const VOJES_CHAPTERS = [
  "Chapitre 1 — Circuit et agents économiques",
  "Chapitre 2 — Le financement de l'économie",
  "Chapitre 3 — Les fonctions de la monnaie et la création monétaire",
  "Chapitre 4 — Les marchés de capitaux",
  "Chapitre 5 — La banque centrale et la politique monétaire",
  "Chapitre 6 — Le système bancaire français et européen",
  "Chapitre 7 — La réglementation bancaire prudentielle",
  "Chapitre 8 — Les produits et services bancaires",
  "Chapitre 9 — La relation client en banque",
  "Chapitre 10 — Le crédit aux particuliers",
  "Chapitre 11 — Le crédit aux entreprises",
  "Chapitre 12 — L'épargne et les placements",
  "Chapitre 13 — L'assurance",
  "Chapitre 14 — La monnaie et les paiements",
  "Chapitre 15 — La lutte contre le blanchiment (LCB-FT)",
  "Chapitre 16 — La démarche qualité",
  "Chapitre 17 — L'analyse de l'environnement",
  "Chapitre 18 — La politique commerciale de la banque",
  "Chapitre 19 — L'environnement économique et les indicateurs",
  "Chapitre 20 — Le contrat de consommation",
  "Chapitre 21 — Le droit des contrats",
  "Chapitre 22 — La responsabilité civile et pénale",
  "Chapitre 23 — Le droit du travail",
  "Chapitre 24 — Les formes juridiques des entreprises",
  "Chapitre 25 — La fiscalité des entreprises et des particuliers",
  "Chapitre 26 — La protection sociale",
  "Chapitre 27 — Le marché du travail et l'emploi",
  "Chapitre 28 — La mondialisation et les échanges internationaux",
  "Chapitre 29 — L'intégration européenne",
  "Chapitre 30 — Le développement durable et la RSE",
  "Chapitre 31 — La transformation numérique de la banque",
];

// Chapitres CESBF
const CESBF_CHAPTERS = [
  "MODULE 1 — Chap 1 : Droit au compte & inclusion bancaire",
  "MODULE 1 — Chap 2 : Convention, médiation & mobilité",
  "MODULE 2 — Chap 1 : Agios débiteurs",
  "MODULE 2 — Chap 2 : Blanchiment & LCB-FT",
  "MODULE 2 — Chap 3 : Événements exceptionnels",
  "MODULE 2 — Chap 4 : Risque débiteur & clôture",
  "MODULE 2 — Chap 5 : Suivi courant",
  "MODULE 3 — Chap 1 : Espèces, virement, prélèvement",
  "MODULE 3 — Chap 2 : Chèque & carte bancaire",
  "MODULE 3 — Chap 3 : Nouvelles technologies & international",
  "MODULE 4 — Chap 1 : Livrets réglementés",
  "MODULE 4 — Chap 2 : PEL, CEL & épargne à terme",
  "MODULE 4 — Chap 3 : Assurance-vie",
  "MODULE 4 — Chap 4 : PER & instruments financiers",
  "MODULE 4 — Chap 5 : Fiscalité de l'épargne",
  "MODULE 4 — Chap 6 : Gestion de patrimoine",
  "MODULE 5 — Chap 1 : Marché & vie du contrat",
  "MODULE 5 — Chap 2 : Produits IARD & prévoyance",
  "MODULE 5 — Chap 3 : Assurance emprunteur",
  "MODULE 6 — Chap 1 : Montage de dossier & analyse du risque",
  "MODULE 6 — Chap 2 : Types de crédits & réglementation",
  "MODULE 6 — Chap 3 : Vie du contrat de prêt",
  "MODULE 7 — Chap 1 : Impôt sur le revenu & prélèvements sociaux",
  "MODULE 7 — Chap 2 : Fiscalité patrimoniale",
  "MODULE 7 — Chap 3 : Succession, donation & IFI",
];

export function getChapters(subject) {
  if (subject === "CESBF") return CESBF_CHAPTERS;
  return VOJES_CHAPTERS;
}

export default function ChapterSelect({ subject, value, onChange }) {
  const chapters = getChapters(subject);
  const base = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Chapitre</label>
      <select className={base} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Sélectionner un chapitre —</option>
        {chapters.map((ch) => (
          <option key={ch} value={ch}>{ch}</option>
        ))}
        <option value="__custom__">✏️ Autre (saisie libre)</option>
      </select>
      {value === "__custom__" && (
        <input
          className={`${base} mt-2`}
          placeholder="Nom du chapitre personnalisé…"
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}