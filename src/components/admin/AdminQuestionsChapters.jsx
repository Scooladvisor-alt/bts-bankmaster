import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, ChevronDown, ChevronRight, Edit3, Trash2, X, Save, Pencil } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

// ── Chapitres VOJES dans l'ordre 1→31 ──
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

// ── Groupes CESBF avec leurs chapitres ──
const CESBF_GROUPS = [
  { title: "MODULE 1 — OUVERTURE DE COMPTE", chapters: [
    "MODULE 1 — Chap 1 : Droit au compte & inclusion bancaire",
    "MODULE 1 — Chap 2 : Convention, médiation & mobilité",
  ]},
  { title: "MODULE 2 — SUIVI DES COMPTES BANCAIRES", chapters: [
    "MODULE 2 — Chap 1 : Agios débiteurs",
    "MODULE 2 — Chap 2 : Blanchiment & LCB-FT",
    "MODULE 2 — Chap 3 : Événements exceptionnels",
    "MODULE 2 — Chap 4 : Risque débiteur & clôture",
    "MODULE 2 — Chap 5 : Suivi courant",
  ]},
  { title: "MODULE 3 — MOYENS DE PAIEMENT", chapters: [
    "MODULE 3 — Chap 1 : Espèces, virement, prélèvement",
    "MODULE 3 — Chap 2 : Chèque & carte bancaire",
    "MODULE 3 — Chap 3 : Nouvelles technologies & international",
  ]},
  { title: "MODULE 4 — ÉPARGNE", chapters: [
    "MODULE 4 — Chap 1 : Livrets réglementés",
    "MODULE 4 — Chap 2 : PEL, CEL & épargne à terme",
    "MODULE 4 — Chap 3 : Assurance-vie",
    "MODULE 4 — Chap 4 : PER & instruments financiers",
    "MODULE 4 — Chap 5 : Fiscalité de l'épargne",
    "MODULE 4 — Chap 6 : Gestion de patrimoine",
  ]},
  { title: "MODULE 5 — ASSURANCE", chapters: [
    "MODULE 5 — Chap 1 : Marché & vie du contrat",
    "MODULE 5 — Chap 2 : Produits IARD & prévoyance",
    "MODULE 5 — Chap 3 : Assurance emprunteur",
  ]},
  { title: "MODULE 6 — FINANCEMENT", chapters: [
    "MODULE 6 — Chap 1 : Montage de dossier & analyse du risque",
    "MODULE 6 — Chap 2 : Types de crédits & réglementation",
    "MODULE 6 — Chap 3 : Vie du contrat de prêt",
  ]},
  { title: "MODULE 7 — FISCALITÉ", chapters: [
    "MODULE 7 — Chap 1 : Impôt sur le revenu & prélèvements sociaux",
    "MODULE 7 — Chap 2 : Fiscalité patrimoniale",
    "MODULE 7 — Chap 3 : Succession, donation & IFI",
  ]},
];

const ALL_CESBF_CHAPTERS = CESBF_GROUPS.flatMap(g => g.chapters);

// ── Éditeur de champ générique ──
function FieldEditor({ field, value, onChange, full }) {
  const base = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";
  if (field.type === "textarea") return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">{field.label}</label>
      <textarea className={`${base} min-h-[80px]`} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
  if (field.type === "number") return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">{field.label}</label>
      <input type="number" className={base} value={value ?? ""} onChange={e => onChange(e.target.value === "" ? null : Number(e.target.value))} />
    </div>
  );
  if (field.type === "array-options") {
    const arr = Array.isArray(value) ? value : ["", "", "", ""];
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">{field.label}</label>
        <div className="space-y-1.5">
          {arr.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${full?.correct_index === i ? "bg-green-500 text-white" : "bg-stone-200 text-stone-600"}`}>
                {String.fromCharCode(65 + i)}
              </div>
              <input className={base} value={opt} placeholder={`Option ${i + 1}`}
                onChange={e => { const next = [...arr]; next[i] = e.target.value; onChange(next); }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">{field.label}</label>
      <input className={base} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ── Modal ajout / édition d'une question ──
function QuestionModal({ question, onSave, onClose, defaultChapter, subject, modeFilter }) {
  const [editing, setEditing] = useState(question || {
    subject,
    mode: modeFilter || "pareto",
    chapter: defaultChapter || "",
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
    explanation: "",
  });
  const update = (key, val) => setEditing(e => ({ ...e, [key]: val }));
  const handleSave = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = editing;
    if (id) await base44.entities.Question.update(id, payload);
    else await base44.entities.Question.create(payload);
    onSave();
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">{editing.id ? "Modifier la question" : "Nouvelle question"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500" /></button>
        </div>
        <div className="mb-3 bg-stone-50 rounded-xl px-3 py-2 text-xs text-stone-500 font-bold border border-stone-100">📂 {editing.chapter || "—"}</div>
        <div className="space-y-3">
          {[
            { key: "question", label: "Question", type: "textarea" },
            { key: "options", label: "Options (A/B/C/D)", type: "array-options" },
            { key: "correct_index", label: "Bonne réponse (0=A, 1=B, 2=C, 3=D)", type: "number" },
            { key: "explanation", label: "Explication (optionnel)", type: "textarea" },
          ].map(f => (
            <FieldEditor key={f.key} field={f} value={editing[f.key]} onChange={v => update(f.key, v)} full={editing} />
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <DuoButton variant="ghost" onClick={onClose}>Annuler</DuoButton>
          <DuoButton variant="primary" onClick={handleSave}><Save className="w-4 h-4 inline mr-1" /> Enregistrer</DuoButton>
        </div>
      </div>
    </div>
  );
}

// ── Ligne de chapitre (accordéon) ──
// isCustom = true pour chapitres hors référentiel (peuvent être renommés/supprimés)
function ChapterRow({ chapter, questions, subject, modeFilter, onRefresh, isCustom = false }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(chapter);

  const chapterQs = questions.filter(q => q.chapter === chapter);

  const handleDeleteQuestion = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    await base44.entities.Question.delete(id);
    onRefresh();
  };

  const handleDeleteChapter = async () => {
    if (!confirm(`Supprimer le chapitre "${chapter}" et toutes ses ${chapterQs.length} question(s) ?`)) return;
    await Promise.all(chapterQs.map(q => base44.entities.Question.delete(q.id)));
    onRefresh();
  };

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === chapter) { setRenaming(false); return; }
    await Promise.all(chapterQs.map(q => base44.entities.Question.update(q.id, { chapter: newName.trim() })));
    setRenaming(false);
    onRefresh();
  };

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden mb-2">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition-colors">
        {/* Left: toggle + name */}
        <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
          <span className="font-bold text-sm text-stone-800 truncate">{chapter}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">
            {chapterQs.length}
          </span>
        </button>
        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={e => { e.stopPropagation(); setModal("new"); }}
            className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-2 py-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
          {isCustom && (
            <>
              <button
                onClick={() => { setRenaming(true); setNewName(chapter); }}
                className="p-1.5 text-stone-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                title="Renommer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteChapter}
                className="p-1.5 text-stone-400 hover:text-destructive rounded-lg hover:bg-red-50 transition-colors"
                title="Supprimer le chapitre"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rename inline */}
      {renaming && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-t border-blue-100">
          <input
            className="flex-1 rounded-lg border border-blue-200 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
          />
          <button onClick={handleRename} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600"><Save className="w-3.5 h-3.5" /></button>
          <button onClick={() => setRenaming(false)} className="px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-300"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {open && (
        <div className="border-t border-stone-100 bg-stone-50">
          {chapterQs.length === 0 ? (
            <div className="px-4 py-4 text-sm text-stone-400 text-center">Aucune question — clique sur "Ajouter" pour en créer une.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {chapterQs.map(q => (
                <div key={q.id} className="flex items-start justify-between px-4 py-3 hover:bg-white transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-sm text-stone-800 font-medium leading-snug truncate">{q.question}</p>
                      {q.mode !== modeFilter && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0 border border-yellow-200">
                          {q.mode}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {(q.options || []).map((opt, i) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${i === q.correct_index ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                          {String.fromCharCode(65 + i)}: {opt?.slice(0, 25)}{opt?.length > 25 ? "…" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setModal(q)} className="p-1.5 text-stone-400 hover:text-primary rounded-lg hover:bg-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-stone-400 hover:text-destructive rounded-lg hover:bg-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal && (
        <QuestionModal
          question={modal === "new" ? null : modal}
          defaultChapter={chapter}
          subject={subject}
          modeFilter={modeFilter}
          onSave={() => { setModal(null); onRefresh(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ── Composant principal ──
export default function AdminQuestionsChapters({ subjectFilter, modeFilter: initialModeFilter }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  // Extra custom chapters créés via le bouton "Nouveau chapitre" (pas encore en BDD)
  const [extraCustomChapters, setExtraCustomChapters] = useState([]);
  const [modeFilter, setModeFilter] = useState(initialModeFilter || "pareto");

  const subject = subjectFilter || "VOJES";

  const load = async () => {
    setLoading(true);
    // QCM Jeu : afficher mode:"jeu" + mode:"pareto" (fusionnés, sans doublons, chacun garde son vrai mode)
    // QCM Infini : afficher mode:"infini" + mode:"pareto" (idem)
    if (modeFilter === "jeu" || modeFilter === "infini") {
      const [specific, pareto] = await Promise.all([
        base44.entities.Question.filter({ subject, mode: modeFilter }, null, 500),
        base44.entities.Question.filter({ subject, mode: "pareto" }, null, 500),
      ]);
      const seen = new Set();
      const merged = [...specific, ...pareto].filter(q => {
        if (seen.has(q.id)) return false;
        seen.add(q.id);
        return true;
      });
      setQuestions(merged);
    } else {
      const list = await base44.entities.Question.filter({ subject, mode: modeFilter || "pareto" }, null, 500);
      setQuestions(list || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setExtraCustomChapters([]); // reset extra chapitres quand on change de matière
    load();
  }, [subjectFilter, modeFilter]);

  const handleAddChapter = () => {
    const name = newChapterName.trim();
    if (!name) return;
    const chaptersInDB = new Set(questions.map(q => q.chapter).filter(Boolean));
    if (!chaptersInDB.has(name) && !extraCustomChapters.includes(name)) {
      setExtraCustomChapters(prev => [...prev, name]);
    }
    setNewChapterName("");
    setShowAddChapter(false);
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;

  const totalQ = questions.length;
  const chaptersInDB = new Set(questions.map(q => q.chapter).filter(Boolean));

  // ── VOJES : tous les chapitres officiels dans l'ordre 1→31 + custom ──
  if (subject === "VOJES") {
    // Pour jeu/infini : séparer les questions pareto des questions jeu
    const paretoQuestions = (modeFilter === "jeu" || modeFilter === "infini")
      ? questions.filter(q => q.mode === "pareto")
      : questions;
    const extraQuestions = (modeFilter === "jeu" || modeFilter === "infini")
      ? questions.filter(q => q.mode === modeFilter)
      : [];

    const chaptersInDBPareto = new Set(paretoQuestions.map(q => q.chapter).filter(Boolean));
    const chaptersInDBExtra = new Set(extraQuestions.map(q => q.chapter).filter(Boolean));

    // Section pareto : chapitres officiels + custom
    const officialWithQPareto = VOJES_CHAPTERS.filter(ch => chaptersInDBPareto.has(ch));
    const customInDBPareto = [...chaptersInDBPareto].filter(ch => !VOJES_CHAPTERS.includes(ch)).sort();

    // Section extra (questions jeu/infini supplémentaires) : par chapitre
    const extraChaptersOrdered = [...chaptersInDBExtra].sort();
    const customExtra = extraCustomChapters.filter(ch => !chaptersInDB.has(ch) && !VOJES_CHAPTERS.includes(ch));

    // Mode pareto classique (pas jeu/infini) : comportement original
    if (modeFilter !== "jeu" && modeFilter !== "infini") {
      const officialWithQ = VOJES_CHAPTERS.filter(ch => chaptersInDB.has(ch));
      const customInDB = [...chaptersInDB].filter(ch => !VOJES_CHAPTERS.includes(ch)).sort();
      return (
        <div>
          <div className="flex items-center justify-end mb-4">
            <button onClick={() => setShowAddChapter(v => !v)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nouveau chapitre personnalisé
            </button>
          </div>
          {showAddChapter && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <input
                className="flex-1 rounded-lg border border-green-200 px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
                placeholder="Nom du nouveau chapitre…"
                value={newChapterName}
                onChange={e => setNewChapterName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddChapter(); if (e.key === "Escape") setShowAddChapter(false); }}
                autoFocus
              />
              <button onClick={handleAddChapter} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Créer</button>
              <button onClick={() => { setShowAddChapter(false); setNewChapterName(""); }} className="px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold">Annuler</button>
            </div>
          )}
          {officialWithQ.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-2 border-b border-stone-200 pb-1">CHAPITRES OFFICIELS</div>
              {officialWithQ.map(ch => (
                <ChapterRow key={ch} chapter={ch} questions={questions} subject={subject} modeFilter={modeFilter} onRefresh={load} isCustom={true} />
              ))}
            </div>
          )}
          {(customInDB.length > 0 || customExtra.length > 0) && (
            <div className="mt-2 mb-1">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-2 border-b border-stone-200 pb-1">CHAPITRES PERSONNALISÉS</div>
              {customInDB.map(ch => (
                <ChapterRow key={ch} chapter={ch} questions={questions} subject={subject} modeFilter={modeFilter} onRefresh={load} isCustom={true} />
              ))}
              {customExtra.map(ch => (
                <ChapterRow key={ch} chapter={ch} questions={[]} subject={subject} modeFilter={modeFilter} onRefresh={() => { setExtraCustomChapters(prev => prev.filter(c => c !== ch)); load(); }} isCustom={true} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Mode jeu/infini : deux sections séparées
    return (
      <div>
        {/* ── SECTION 1 : Questions QCM Pareto (inchangées) ── */}
        {(officialWithQPareto.length > 0 || customInDBPareto.length > 0) && (
          <div className="mb-6">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-2 border-b-2 border-stone-300 pb-1">
              📊 QUESTIONS QCM PARETO (partagées)
            </div>
            {officialWithQPareto.map(ch => (
              <ChapterRow key={ch} chapter={ch} questions={paretoQuestions} subject={subject} modeFilter="pareto" onRefresh={load} isCustom={true} />
            ))}
            {customInDBPareto.map(ch => (
              <ChapterRow key={ch} chapter={ch} questions={paretoQuestions} subject={subject} modeFilter="pareto" onRefresh={load} isCustom={true} />
            ))}
          </div>
        )}

        {/* ── SECTION 2 : Questions supplémentaires propres à ce mode ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2 border-b-2 border-blue-200 pb-1">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500">
              ➕ QUESTIONS SUPPLÉMENTAIRES ({modeFilter.toUpperCase()}) — {extraQuestions.length} questions
            </div>
            <button onClick={() => setShowAddChapter(v => !v)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nouveau chapitre
            </button>
          </div>
          {showAddChapter && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <input
                className="flex-1 rounded-lg border border-green-200 px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
                placeholder="Nom du nouveau chapitre…"
                value={newChapterName}
                onChange={e => setNewChapterName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddChapter(); if (e.key === "Escape") setShowAddChapter(false); }}
                autoFocus
              />
              <button onClick={handleAddChapter} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Créer</button>
              <button onClick={() => { setShowAddChapter(false); setNewChapterName(""); }} className="px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold">Annuler</button>
            </div>
          )}
          {extraChaptersOrdered.length === 0 && customExtra.length === 0 ? (
            <div className="text-sm text-stone-400 italic px-2 py-4 text-center">Aucune question supplémentaire pour ce mode.</div>
          ) : (
            <>
              {extraChaptersOrdered.map(ch => (
                <ChapterRow key={ch} chapter={ch} questions={extraQuestions} subject={subject} modeFilter={modeFilter} onRefresh={load} isCustom={true} />
              ))}
              {customExtra.map(ch => (
                <ChapterRow key={ch} chapter={ch} questions={[]} subject={subject} modeFilter={modeFilter} onRefresh={() => { setExtraCustomChapters(prev => prev.filter(c => c !== ch)); load(); }} isCustom={true} />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── CESBF : tous les groupes/chapitres dans l'ordre officiel + custom ──
  const customInDBCesbf = [...chaptersInDB].filter(ch => !ALL_CESBF_CHAPTERS.includes(ch)).sort();
  const customExtraCesbf = extraCustomChapters.filter(ch => !chaptersInDB.has(ch) && !ALL_CESBF_CHAPTERS.includes(ch));

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={() => setShowAddChapter(v => !v)} className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouveau chapitre personnalisé
        </button>
      </div>

      {showAddChapter && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
          <input
            className="flex-1 rounded-lg border border-green-200 px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
            placeholder="Nom du nouveau chapitre…"
            value={newChapterName}
            onChange={e => setNewChapterName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddChapter(); if (e.key === "Escape") setShowAddChapter(false); }}
            autoFocus
          />
          <button onClick={handleAddChapter} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Créer</button>
          <button onClick={() => { setShowAddChapter(false); setNewChapterName(""); }} className="px-3 py-1.5 bg-stone-200 text-stone-600 rounded-lg text-xs font-bold">Annuler</button>
        </div>
      )}

      {/* Tous les groupes CESBF dans l'ordre officiel — masquer chapitres à 0 questions */}
      {CESBF_GROUPS.map(group => {
        const chaptersWithQ = group.chapters.filter(ch => chaptersInDB.has(ch));
        if (chaptersWithQ.length === 0) return null;
        return (
          <div key={group.title} className="mb-5">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-2 border-b border-stone-200 pb-1">{group.title}</div>
            {chaptersWithQ.map(ch => (
              <ChapterRow key={ch} chapter={ch} questions={questions} subject={subject} modeFilter={modeFilter} onRefresh={load} isCustom={true} />
            ))}
          </div>
        );
      })}

      {/* Chapitres personnalisés */}
      {(customInDBCesbf.length > 0 || customExtraCesbf.length > 0) && (
        <div className="mb-5">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 px-1 mb-2 border-b border-stone-200 pb-1">CHAPITRES PERSONNALISÉS</div>
          {customInDBCesbf.map(ch => (
            <ChapterRow key={ch} chapter={ch} questions={questions} subject={subject} modeFilter={modeFilter} onRefresh={load} isCustom={true} />
          ))}
          {customExtraCesbf.map(ch => (
            <ChapterRow key={ch} chapter={ch} questions={[]} subject={subject} modeFilter={modeFilter} onRefresh={() => { setExtraCustomChapters(prev => prev.filter(c => c !== ch)); load(); }} isCustom={true} />
          ))}
        </div>
      )}
    </div>
  );
}