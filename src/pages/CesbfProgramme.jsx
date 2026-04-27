import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, CheckSquare, Square, RotateCcw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const PROGRAMME = [
  {
    id: "ouverture",
    title: "OUVERTURE DE COMPTE",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    notions: [
      "Compte de paiement, de dépôt, d'épargne, d'instruments financiers",
      "Compte individuel / collectif / indivis / joint",
      "Solidarité active / passive",
      "Désolidarisation / dénonciation d'un compte joint",
      "Notion de responsabilité légale : mineur / majeur, majeur protégé",
      "Droit au compte, SBB, dispositif envers les personnes fragiles",
      "La contractualisation de l'opération d'ouverture",
      "Décision d'ouverture (risques, rentabilité)",
      "Documents liés à l'ouverture",
      "Fichiers BDF (FCC, FICP)",
      "Formalités liées à l'ouverture (y compris FICOBA)",
      "Procuration",
      "Mobilité bancaire",
      "Les offres groupées de service : contenu, avantages, tarifs, l'offre spécifique personnes en fragilité financière",
      "Les produits et services liés au compte : description, avantages pour le client, la banque",
    ],
    calculs: [
      "Comparer le tarif de l'offre groupée avec le tarif des produits pris individuellement",
    ],
  },
  {
    id: "suivi",
    title: "SUIVI DES COMPTES BANCAIRES",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    notions: [
      "Opérations débit / crédit, les circuits de paiement, les dates de valeur",
      "Blanchiment / fausse monnaie",
      "Saisie attribution, solde bancaire insaisissable",
      "Tarification des incidents et irrégularités sur le compte",
      "Gestion du risque débiteur : analyse / décisions / mesures à prendre",
      "Clôture du compte : procédure, conseil, formalités",
      "Comptes inactifs (loi Eckert)",
      "Conséquence du décès d'un titulaire",
    ],
    calculs: [
      "Savoir établir un relevé de compte",
      "Calculer des agios débiteurs (méthodes directes, méthode des nombres)",
      "Calculer des commissions et connaître les règles de tarification concernant les rejets",
    ],
  },
  {
    id: "paiement",
    title: "MISE À DISPOSITION ET SUIVI DES MOYENS DE PAIEMENT",
    color: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    notions: [
      "Les différents moyens de paiement adaptés (y compris à l'étranger)",
      "Mise en place d'un prélèvement SEPA",
      "Opposition, contestation",
      "Délivrance d'un chéquier : remise, retrait, rejet (interdiction bancaire), opposition",
      "Délivrance de carte : remise, retrait, opposition",
      "Responsabilité du porteur en cas de vol, perte, utilisation frauduleuse des données de la carte",
      "Paiement par internet",
      "Moyens de paiement dématérialisés (e-wallet, paiement sans contact…)",
    ],
    calculs: [
      "Déterminer frais de rejet de chèques",
      "Calculer la somme prise en charge par la banque en cas de vol, perte, utilisation frauduleuse de carte",
      "Calculer l'intérêt de souscrire un forfait à l'étranger",
    ],
  },
  {
    id: "epargne",
    title: "ÉPARGNE BANCAIRE ET NON BANCAIRE",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    notions: [
      "Description claire du principe, des avantages et du fonctionnement des : LA, LDDS, Livret Jeune, LEP, CSL, CEL, PEL, compte à terme (bons de caisse)",
      "Règle de fixation des taux, taux en vigueur",
      "Fiscalité de l'épargne réglementée",
      "PEL : impact de la clôture suivant durée de détention, transmission droits à prêts, devenir à la fin de la durée contractuelle",
      "Assurance-vie : principe, avantages, inconvénients, fiscalité, différents supports",
      "PER (Plan Épargne Retraite)",
    ],
    calculs: [
      "Intérêts annuels sur livret d'épargne disponible – dates de valeur, quinzaine",
      "Intérêts et capital acquis sur une épargne placée plus d'1 an (formule des intérêts composés)",
      "Utilisation de la calculatrice financière ou d'une table pour capital acquis avec un capital initial, versement mensuel, annuel régulier sur PEL, assurance-vie",
      "Règle fiscale sur intérêts (exonération, calcul, acompte / crédit d'impôt, formule retrait partiel sur assurance-vie)",
      "Calcul droits de succession avec et hors assurance-vie",
      "Calcul d'une enveloppe sur PER et de l'économie fiscale",
    ],
  },
  {
    id: "fiscalite",
    title: "FISCALITÉ",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    notions: [
      "PFU de 30% : IR de 12,8% + prélèvements sociaux",
      "Prélèvement obligatoire à la source de 12,8% sous forme d'acompte et restitution sous forme de crédit d'impôt",
      "Les différents revenus imposables à l'IR",
      "Les différentes étapes de calcul de l'impôt",
      "Notion de TMI (Tranche Marginale d'Imposition)",
      "Exemple de charges déductibles : pensions alimentaires versées, versement sur PER",
      "Principe du calcul d'IFI : assiette, barème",
      "Principe du calcul de droits de succession : assiette, abattement, barème et droits de donation",
    ],
    calculs: [
      "Détermination d'un TMI",
      "Calcul d'un impôt à payer",
      "Règles fiscales des différents revenus",
      "Calcul d'IFI",
      "Calcul de droits de succession et donation à partir du barème en « tranches »",
    ],
  },
  {
    id: "assurances",
    title: "ASSURANCES",
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    notions: [
      "Les principaux produits d'assurance : définition, avantage, les risques couverts, garanties, les « plus » des assurances, valeur à neuf, valeur de remplacement",
      "Assurance de biens / de personne",
      "Assurance forfaitaire / indemnitaire",
      "Assurance obligatoire / facultative",
      "La responsabilité civile",
      "Les avantages pour la banque à commercialiser des produits d'assurance",
      "Quelles assurances pour quels risques",
      "Franchise",
      "Coefficient Réduction Majoration (CRM / bonus-malus)",
      "Les conditions de résiliation (loi Châtel, loi Hamon), la réglementation, information précontractuelle",
    ],
    calculs: [
      "Établissement de devis à partir d'annexes",
      "Calcul de l'évolution d'un CRM",
      "Calcul de montant à rembourser compte tenu de la franchise",
    ],
  },
  {
    id: "credits",
    title: "CRÉDITS",
    color: "from-green-500 to-emerald-600",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    notions: [
      "Capacité de remboursement, taux d'endettement, reste à vivre",
      "Plan de financement",
      "Assurance emprunteur : principe, réglementation, avantage, tarif en % du capital emprunté, % du capital restant dû",
      "Garanties",
      "Décision en tenant compte du risque, de la rentabilité, de l'aspect commercial",
      "Différents types de crédits à la consommation : principe du crédit renouvelable, du prêt étudiant (franchise partielle, totale), de la LOA",
      "Différents types de crédits immobiliers : principe du prêt relais, du PAS, du prêt conventionné, du prêt EL, du PTZ",
      "Réglementation crédit conso, crédit immobilier : information précontractuelle, délais",
      "Remboursement anticipé, la renégociation, le regroupement de crédit",
      "Le surendettement",
    ],
    calculs: [
      "Capacité de remboursement, taux d'endettement, reste à vivre",
      "Établir un plan de financement équilibré",
      "Calcul d'une échéance avec ou sans assurance avec Financière ou table, avec ou sans franchise",
      "Tableau d'amortissement",
      "Analyser et utiliser des annexes de Prêt EL, de PTZ",
    ],
  },
  {
    id: "epargne-financiere",
    title: "ÉPARGNE FINANCIÈRE",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    notions: [
      "Titres et contrats financiers",
      "Les actions, obligations : comparatif, revenus, risques, fiscalité",
      "Les parts ou actions d'OPCVM : principe d'un OPC (SICAV, FCP), famille, avantage, valeur liquidative unitaire, gestion ISR",
      "MIF : principe, conséquences",
      "Compte d'Instruments Financiers / PEA : avantages, inconvénients, fiscalité",
      "La négociation : les lieux, les ordres de bourse, la fixation du prix",
      "La compensation : principe, avantage",
      "Le règlement livraison : les acteurs, les délais",
      "Les organes de contrôle : AMF",
      "Notion d'opérations sur titres : introduction en bourse, augmentation de capital",
    ],
    calculs: [
      "Calculer le nombre de parts ou d'actions OPCVM achetés compte tenu des frais",
      "Impact fiscal de retrait sur PEA",
      "Effectuer des ordres de bourse à partir d'annexe",
      "Calculer un prix moyen d'exécution",
      "Le montant débité ou crédité sur le compte compte tenu des frais",
      "La plus ou moins-value",
      "Calculer un coupon et le prix d'une obligation compte tenu de son cours pied de coupon + coupon couru",
      "Appliquer la fiscalité sur revenus et plus-values",
    ],
  },
];

const STORAGE_KEY = "cesbf_programme_checked";

function loadChecked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveChecked(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function itemKey(themeId, type, index) {
  return `${themeId}_${type}_${index}`;
}

function ThemeSection({ theme, checked, onToggle }) {
  const [open, setOpen] = useState(true);

  const totalNotions = theme.notions.length;
  const totalCalculs = theme.calculs.length;
  const total = totalNotions + totalCalculs;

  const doneNotions = theme.notions.filter((_, i) => checked[itemKey(theme.id, "n", i)]).length;
  const doneCalculs = theme.calculs.filter((_, i) => checked[itemKey(theme.id, "c", i)]).length;
  const done = doneNotions + doneCalculs;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${theme.border} overflow-hidden mb-4 shadow-sm`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${theme.bg} text-left`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${theme.color} shrink-0`} />
          <div className="min-w-0">
            <div className="font-display font-bold text-stone-900 text-sm leading-tight">{theme.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-24 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-stone-500">{done}/{total} ({pct}%)</span>
            </div>
          </div>
        </div>
        <span className="text-stone-400 text-lg ml-3">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="bg-white divide-y divide-stone-50">
          {/* Notions */}
          <div className="px-4 py-3">
            <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ${theme.badge}`}>
              📚 Notions ({doneNotions}/{totalNotions})
            </div>
            <div className="space-y-2">
              {theme.notions.map((notion, i) => {
                const key = itemKey(theme.id, "n", i);
                const isChecked = !!checked[key];
                return (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <button
                      onClick={() => onToggle(key)}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? "bg-green-500 border-green-500" : "border-stone-300 group-hover:border-green-400"
                      }`}
                    >
                      {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className={`text-sm leading-relaxed transition-colors ${isChecked ? "line-through text-stone-400" : "text-stone-700"}`}>
                      {notion}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Calculs */}
          {theme.calculs.length > 0 && (
            <div className="px-4 py-3">
              <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ${theme.badge}`}>
                🔢 Calculs ({doneCalculs}/{totalCalculs})
              </div>
              <div className="space-y-2">
                {theme.calculs.map((calcul, i) => {
                  const key = itemKey(theme.id, "c", i);
                  const isChecked = !!checked[key];
                  return (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => onToggle(key)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? "bg-orange-400 border-orange-400" : "border-stone-300 group-hover:border-orange-300"
                        }`}
                      >
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`text-sm leading-relaxed transition-colors ${isChecked ? "line-through text-stone-400" : "text-stone-700"}`}>
                        {calcul}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function CesbfProgramme() {
  const [checked, setChecked] = useState(loadChecked);

  useEffect(() => { saveChecked(checked); }, [checked]);

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const totalAll = PROGRAMME.reduce((acc, t) => acc + t.notions.length + t.calculs.length, 0);
  const doneAll = Object.values(checked).filter(Boolean).length;
  const pctAll = Math.round((doneAll / totalAll) * 100);

  const reset = () => {
    if (confirm("Remettre à zéro toute la progression ?")) {
      setChecked({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/cesbf" className="p-2 rounded-xl hover:bg-orange-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-orange-500">CESBF</div>
            <h1 className="font-display text-xl font-bold text-stone-900">Programme de révision</h1>
          </div>
          <button onClick={reset} className="p-2 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors" title="Réinitialiser">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Barre de progression globale */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
            <div className="flex-1 h-3 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${pctAll}%` }}
              />
            </div>
            <span className="text-sm font-bold text-orange-600 shrink-0">{doneAll}/{totalAll} ({pctAll}%)</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* Légende */}
        <div className="flex gap-4 mb-5 text-xs font-bold text-stone-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-green-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            Notion maîtrisée
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-md bg-orange-400 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            Calcul maîtrisé
          </div>
        </div>

        {PROGRAMME.map(theme => (
          <ThemeSection key={theme.id} theme={theme} checked={checked} onToggle={toggle} />
        ))}

        {/* Note de bas de page */}
        <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-500 leading-relaxed">
          <span className="font-bold">+ Transversal :</span> Diagnostic de la situation du client + Méthodologie d'élaboration de solution d'équipement de compte, d'épargne, de crédit et d'assurance.
        </div>
      </div>
    </div>
  );
}