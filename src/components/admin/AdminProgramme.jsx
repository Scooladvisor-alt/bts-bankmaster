import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Save, X, ChevronDown, ChevronRight, GripVertical, Edit3 } from "lucide-react";

// Programme par défaut CESBF (seed initial)
const DEFAULT_CESBF = [
  { theme_id: "ouverture", theme_title: "OUVERTURE DE COMPTE", theme_order: 1, notions: [
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
  ], calculs: ["Comparer le tarif de l'offre groupée avec le tarif des produits pris individuellement"] },
  { theme_id: "suivi", theme_title: "SUIVI DES COMPTES BANCAIRES", theme_order: 2, notions: [
    "Opérations débit / crédit, les circuits de paiement, les dates de valeur",
    "Blanchiment / fausse monnaie",
    "Saisie attribution, solde bancaire insaisissable",
    "Tarification des incidents et irrégularités sur le compte",
    "Gestion du risque débiteur : analyse / décisions / mesures à prendre",
    "Clôture du compte : procédure, conseil, formalités",
    "Comptes inactifs (loi Eckert)",
    "Conséquence du décès d'un titulaire",
  ], calculs: [
    "Savoir établir un relevé de compte",
    "Calculer des agios débiteurs (méthodes directes, méthode des nombres)",
    "Calculer des commissions et connaître les règles de tarification concernant les rejets",
  ]},
  { theme_id: "paiement", theme_title: "MISE À DISPOSITION ET SUIVI DES MOYENS DE PAIEMENT", theme_order: 3, notions: [
    "Les différents moyens de paiement adaptés (y compris à l'étranger)",
    "Mise en place d'un prélèvement SEPA",
    "Opposition, contestation",
    "Délivrance d'un chéquier : remise, retrait, rejet (interdiction bancaire), opposition",
    "Délivrance de carte : remise, retrait, opposition",
    "Responsabilité du porteur en cas de vol, perte, utilisation frauduleuse des données de la carte",
    "Paiement par internet",
    "Moyens de paiement dématérialisés (e-wallet, paiement sans contact…)",
  ], calculs: [
    "Déterminer frais de rejet de chèques",
    "Calculer la somme prise en charge par la banque en cas de vol, perte, utilisation frauduleuse de carte",
    "Calculer l'intérêt de souscrire un forfait à l'étranger",
  ]},
  { theme_id: "epargne", theme_title: "ÉPARGNE BANCAIRE ET NON BANCAIRE", theme_order: 4, notions: [
    "Description claire du principe, des avantages et du fonctionnement des : LA, LDDS, Livret Jeune, LEP, CSL, CEL, PEL, compte à terme (bons de caisse)",
    "Règle de fixation des taux, taux en vigueur",
    "Fiscalité de l'épargne réglementée",
    "PEL : impact de la clôture suivant durée de détention, transmission droits à prêts, devenir à la fin de la durée contractuelle",
    "Assurance-vie : principe, avantages, inconvénients, fiscalité, différents supports",
    "PER (Plan Épargne Retraite)",
  ], calculs: [
    "Intérêts annuels sur livret d'épargne disponible – dates de valeur, quinzaine",
    "Intérêts et capital acquis sur une épargne placée plus d'1 an (formule des intérêts composés)",
    "Utilisation de la calculatrice financière ou d'une table pour capital acquis avec un capital initial, versement mensuel, annuel régulier sur PEL, assurance-vie",
    "Règle fiscale sur intérêts (exonération, calcul, acompte / crédit d'impôt, formule retrait partiel sur assurance-vie)",
    "Calcul droits de succession avec et hors assurance-vie",
    "Calcul d'une enveloppe sur PER et de l'économie fiscale",
  ]},
  { theme_id: "fiscalite", theme_title: "FISCALITÉ", theme_order: 5, notions: [
    "PFU de 30% : IR de 12,8% + prélèvements sociaux",
    "Prélèvement obligatoire à la source de 12,8% sous forme d'acompte et restitution sous forme de crédit d'impôt",
    "Les différents revenus imposables à l'IR",
    "Les différentes étapes de calcul de l'impôt",
    "Notion de TMI (Tranche Marginale d'Imposition)",
    "Exemple de charges déductibles : pensions alimentaires versées, versement sur PER",
    "Principe du calcul d'IFI : assiette, barème",
    "Principe du calcul de droits de succession : assiette, abattement, barème et droits de donation",
  ], calculs: [
    "Détermination d'un TMI",
    "Calcul d'un impôt à payer",
    "Règles fiscales des différents revenus",
    "Calcul d'IFI",
    "Calcul de droits de succession et donation à partir du barème en « tranches »",
  ]},
  { theme_id: "assurances", theme_title: "ASSURANCES", theme_order: 6, notions: [
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
  ], calculs: [
    "Établissement de devis à partir d'annexes",
    "Calcul de l'évolution d'un CRM",
    "Calcul de montant à rembourser compte tenu de la franchise",
  ]},
  { theme_id: "credits", theme_title: "CRÉDITS", theme_order: 7, notions: [
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
  ], calculs: [
    "Capacité de remboursement, taux d'endettement, reste à vivre",
    "Établir un plan de financement équilibré",
    "Calcul d'une échéance avec ou sans assurance avec Financière ou table, avec ou sans franchise",
    "Tableau d'amortissement",
    "Analyser et utiliser des annexes de Prêt EL, de PTZ",
  ]},
  { theme_id: "epargne-financiere", theme_title: "ÉPARGNE FINANCIÈRE", theme_order: 8, notions: [
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
  ], calculs: [
    "Calculer le nombre de parts ou d'actions OPCVM achetés compte tenu des frais",
    "Impact fiscal de retrait sur PEA",
    "Effectuer des ordres de bourse à partir d'annexe",
    "Calculer un prix moyen d'exécution",
    "Le montant débité ou crédité sur le compte compte tenu des frais",
    "La plus ou moins-value",
    "Calculer un coupon et le prix d'une obligation compte tenu de son cours pied de coupon + coupon couru",
    "Appliquer la fiscalité sur revenus et plus-values",
  ]},
];

const DEFAULT_VOJES = [
  { theme_id: "vojes-general", theme_title: "VOJES — Programme général", theme_order: 1, notions: [
    "Circuit et agents économiques",
    "Le financement de l'économie",
    "Les fonctions de la monnaie et la création monétaire",
    "Les marchés de capitaux",
    "La banque centrale et la politique monétaire",
    "Le système bancaire français et européen",
    "La réglementation bancaire prudentielle",
    "Les produits et services bancaires",
    "La relation client en banque",
    "Le crédit aux particuliers",
    "Le crédit aux entreprises",
    "L'épargne et les placements",
    "L'assurance",
    "La monnaie et les paiements",
    "La lutte contre le blanchiment (LCB-FT)",
    "La démarche qualité",
    "L'analyse de l'environnement",
    "La politique commerciale de la banque",
    "L'environnement économique et les indicateurs",
    "Le contrat de consommation",
    "Le droit des contrats",
    "La responsabilité civile et pénale",
    "Le droit du travail",
    "Les formes juridiques des entreprises",
    "La fiscalité des entreprises et des particuliers",
    "La protection sociale",
    "Le marché du travail et l'emploi",
    "La mondialisation et les échanges internationaux",
    "L'intégration européenne",
    "Le développement durable et la RSE",
    "La transformation numérique de la banque",
  ], calculs: [] },
];

// ── Item editor inline ──
function ItemRow({ item, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.content);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.ProgrammeItem.update(item.id, { content: val });
    setSaving(false);
    setEditing(false);
    onSave();
  };

  return (
    <div className="flex items-start gap-2 group py-1.5">
      <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${item.type === "notion" ? "bg-green-400" : "bg-orange-400"}`} />
      {editing ? (
        <div className="flex-1 flex gap-2">
          <textarea
            className="flex-1 rounded-lg border border-stone-300 px-2 py-1 text-xs focus:outline-none focus:border-primary resize-none min-h-[60px]"
            value={val}
            onChange={e => setVal(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1">
            <button onClick={save} disabled={saving} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </button>
            <button onClick={() => { setEditing(false); setVal(item.content); }} className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"><X className="w-3 h-3" /></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-start justify-between gap-2">
          <span className="text-xs text-stone-700 leading-relaxed">{item.content}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => setEditing(true)} className="p-1 text-stone-400 hover:text-blue-500 rounded"><Edit3 className="w-3 h-3" /></button>
            <button onClick={() => onDelete(item.id)} className="p-1 text-stone-400 hover:text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Thème accordéon ──
function ThemeBlock({ themeId, themeTitle, items, subject, onRefresh, onDeleteTheme }) {
  const [open, setOpen] = useState(false);
  const [addingType, setAddingType] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(themeTitle);
  const [saving, setSaving] = useState(false);

  const notions = items.filter(i => i.type === "notion").sort((a, b) => (a.order || 0) - (b.order || 0));
  const calculs = items.filter(i => i.type === "calcul").sort((a, b) => (a.order || 0) - (b.order || 0));

  const addItem = async (type) => {
    if (!newContent.trim()) return;
    setSaving(true);
    const existing = items.filter(i => i.type === type);
    await base44.entities.ProgrammeItem.create({
      subject,
      theme_id: themeId,
      theme_title: themeTitle,
      theme_order: items[0]?.theme_order || 0,
      type,
      content: newContent.trim(),
      order: existing.length,
    });
    setNewContent("");
    setAddingType(null);
    setSaving(false);
    onRefresh();
  };

  const deleteItem = async (id) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await base44.entities.ProgrammeItem.delete(id);
    onRefresh();
  };

  const saveTitle = async () => {
    if (!titleVal.trim()) return;
    setSaving(true);
    await Promise.all(items.map(item =>
      base44.entities.ProgrammeItem.update(item.id, { theme_title: titleVal.trim() })
    ));
    setSaving(false);
    setEditingTitle(false);
    onRefresh();
  };

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50">
        <button className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
          {editingTitle ? (
            <input
              className="flex-1 rounded-lg border border-stone-300 px-2 py-1 text-sm font-bold focus:outline-none"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditingTitle(false); setTitleVal(themeTitle); }}}
              autoFocus
            />
          ) : (
            <span className="font-bold text-sm text-stone-800 truncate">{themeTitle}</span>
          )}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">
            {notions.length}N + {calculs.length}C
          </span>
        </button>
        <div className="flex items-center gap-1 ml-2">
          {editingTitle ? (
            <>
              <button onClick={saveTitle} disabled={saving} className="p-1.5 bg-green-500 text-white rounded-lg text-xs"><Save className="w-3 h-3" /></button>
              <button onClick={() => { setEditingTitle(false); setTitleVal(themeTitle); }} className="p-1.5 bg-stone-200 text-stone-600 rounded-lg"><X className="w-3 h-3" /></button>
            </>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit3 className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={() => onDeleteTheme(themeId, items)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {open && (
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 space-y-4">
          {/* Notions */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-green-600 mb-2">📚 Notions ({notions.length})</div>
            {notions.map(item => <ItemRow key={item.id} item={item} onSave={onRefresh} onDelete={deleteItem} />)}
            {addingType === "notion" ? (
              <div className="flex gap-2 mt-2">
                <textarea className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs focus:outline-none focus:border-primary resize-none min-h-[52px]" value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Nouvelle notion…" autoFocus />
                <div className="flex flex-col gap-1">
                  <button onClick={() => addItem("notion")} disabled={saving} className="p-1.5 bg-green-500 text-white rounded-lg"><Save className="w-3 h-3" /></button>
                  <button onClick={() => { setAddingType(null); setNewContent(""); }} className="p-1.5 bg-stone-200 text-stone-600 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingType("notion"); setNewContent(""); }} className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 mt-1.5">
                <Plus className="w-3.5 h-3.5" /> Ajouter une notion
              </button>
            )}
          </div>

          {/* Calculs */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500 mb-2">🔢 Calculs ({calculs.length})</div>
            {calculs.map(item => <ItemRow key={item.id} item={item} onSave={onRefresh} onDelete={deleteItem} />)}
            {addingType === "calcul" ? (
              <div className="flex gap-2 mt-2">
                <textarea className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-xs focus:outline-none focus:border-primary resize-none min-h-[52px]" value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Nouveau calcul…" autoFocus />
                <div className="flex flex-col gap-1">
                  <button onClick={() => addItem("calcul")} disabled={saving} className="p-1.5 bg-orange-500 text-white rounded-lg"><Save className="w-3 h-3" /></button>
                  <button onClick={() => { setAddingType(null); setNewContent(""); }} className="p-1.5 bg-stone-200 text-stone-600 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingType("calcul"); setNewContent(""); }} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 mt-1.5">
                <Plus className="w-3.5 h-3.5" /> Ajouter un calcul
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──
export default function AdminProgramme({ subjectFilter }) {
  const subject = subjectFilter || "CESBF";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showAddTheme, setShowAddTheme] = useState(false);
  const [newThemeTitle, setNewThemeTitle] = useState("");

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.ProgrammeItem.filter({ subject }, "theme_order", 2000);
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [subject]);

  const seedDefault = async () => {
    setSeeding(true);
    const defaults = subject === "CESBF" ? DEFAULT_CESBF : DEFAULT_VOJES;
    const records = [];
    defaults.forEach(theme => {
      theme.notions.forEach((n, i) => records.push({ subject, theme_id: theme.theme_id, theme_title: theme.theme_title, theme_order: theme.theme_order, type: "notion", content: n, order: i }));
      theme.calculs.forEach((c, i) => records.push({ subject, theme_id: theme.theme_id, theme_title: theme.theme_title, theme_order: theme.theme_order, type: "calcul", content: c, order: i }));
    });
    await base44.entities.ProgrammeItem.bulkCreate(records);
    setSeeding(false);
    load();
  };

  const deleteTheme = async (themeId, themeItems) => {
    if (!confirm(`Supprimer le thème et ses ${themeItems.length} éléments ?`)) return;
    await Promise.all(themeItems.map(i => base44.entities.ProgrammeItem.delete(i.id)));
    load();
  };

  const addTheme = async () => {
    if (!newThemeTitle.trim()) return;
    const themeId = newThemeTitle.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const maxOrder = Math.max(0, ...items.map(i => i.theme_order || 0));
    await base44.entities.ProgrammeItem.create({
      subject,
      theme_id: themeId,
      theme_title: newThemeTitle.trim(),
      theme_order: maxOrder + 1,
      type: "notion",
      content: "Nouvelle notion (à modifier)",
      order: 0,
    });
    setNewThemeTitle("");
    setShowAddTheme(false);
    load();
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;

  // Grouper par thème
  const themeMap = {};
  items.forEach(item => {
    if (!themeMap[item.theme_id]) themeMap[item.theme_id] = { themeTitle: item.theme_title, themeOrder: item.theme_order || 0, items: [] };
    themeMap[item.theme_id].items.push(item);
  });
  const themes = Object.entries(themeMap).sort((a, b) => a[1].themeOrder - b[1].themeOrder);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-stone-500">
          {themes.length} thème(s) · {items.length} éléments
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <button
              onClick={seedDefault}
              disabled={seeding}
              className="flex items-center gap-1 text-xs font-bold bg-blue-500 text-white rounded-lg px-3 py-1.5 hover:bg-blue-600 disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "⚡"} Importer programme par défaut
            </button>
          )}
          <button onClick={() => setShowAddTheme(v => !v)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5">
            <Plus className="w-3.5 h-3.5" /> Nouveau thème
          </button>
        </div>
      </div>

      {showAddTheme && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-2xl">
          <input
            className="flex-1 rounded-lg border border-green-200 px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
            placeholder="Titre du nouveau thème…"
            value={newThemeTitle}
            onChange={e => setNewThemeTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTheme(); if (e.key === "Escape") setShowAddTheme(false); }}
            autoFocus
          />
          <button onClick={addTheme} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Créer</button>
          <button onClick={() => { setShowAddTheme(false); setNewThemeTitle(""); }} className="px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold">Annuler</button>
        </div>
      )}

      {themes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-bold text-stone-600 mb-1">Aucun contenu pour {subject}</div>
          <div className="text-sm">Clique sur "Importer programme par défaut" pour démarrer, ou crée un thème manuellement.</div>
        </div>
      ) : (
        themes.map(([themeId, { themeTitle, items: themeItems }]) => (
          <ThemeBlock
            key={themeId}
            themeId={themeId}
            themeTitle={themeTitle}
            items={themeItems}
            subject={subject}
            onRefresh={load}
            onDeleteTheme={deleteTheme}
          />
        ))
      )}
    </div>
  );
}