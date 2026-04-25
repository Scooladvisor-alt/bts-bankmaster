import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, ChevronDown, ChevronRight, Edit3, Trash2, X, Save } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import AdminInspecteurSituations from "./AdminInspecteurSituations";

const THEME_EMOJIS = {
  1: "🏛️", 2: "⚖️", 3: "🕵️", 4: "🚫",
  5: "📞", 6: "🤝", 7: "📈", 8: "🧺",
  9: "🏛️", 10: "🔗", 11: "🔀", 12: "🌍",
};

function QuestionModal({ question, onSave, onClose }) {
  const [editing, setEditing] = useState(question || {
    theme_number: 1,
    theme_label: "",
    question: "",
    options: ["", "", ""],
    correct_index: 0,
    explanation: "",
  });
  const update = (key, val) => setEditing(e => ({ ...e, [key]: val }));

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = editing;
    if (id) await base44.entities.AmfQuestion.update(id, payload);
    else await base44.entities.AmfQuestion.create(payload);
    onSave();
  };

  const inputCls = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">{editing.id ? "Modifier la question" : "Nouvelle question"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Numéro de thème</label>
            <input type="number" min="1" max="12" className={inputCls}
              value={editing.theme_number} onChange={e => update("theme_number", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Libellé du thème</label>
            <input className={inputCls} value={editing.theme_label} onChange={e => update("theme_label", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Question</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={editing.question} onChange={e => update("question", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Options (A / B / C)</label>
            <div className="space-y-1.5">
              {(editing.options || ["", "", ""]).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${editing.correct_index === i ? "bg-green-500 text-white" : "bg-stone-200 text-stone-600"}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input className={inputCls} value={opt} placeholder={`Option ${i + 1}`}
                    onChange={e => { const next = [...editing.options]; next[i] = e.target.value; update("options", next); }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Bonne réponse (0=A, 1=B, 2=C)</label>
            <input type="number" min="0" max="2" className={inputCls}
              value={editing.correct_index} onChange={e => update("correct_index", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Explication (optionnel)</label>
            <textarea className={`${inputCls} min-h-[60px]`} value={editing.explanation || ""} onChange={e => update("explanation", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <DuoButton variant="ghost" onClick={onClose}>Annuler</DuoButton>
          <DuoButton variant="primary" onClick={handleSave}><Save className="w-4 h-4 inline mr-1" /> Enregistrer</DuoButton>
        </div>
      </div>
    </div>
  );
}

function ThemeRow({ themeNumber, themeLabel, questions, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    await base44.entities.AmfQuestion.delete(id);
    onRefresh();
  };

  return (
    <div className="border border-stone-200 rounded-2xl overflow-hidden mb-2">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition-colors">
        <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />}
          <span className="text-lg">{THEME_EMOJIS[themeNumber] || "📋"}</span>
          <span className="font-bold text-sm text-stone-800 truncate">Thème {themeNumber} — {themeLabel}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 shrink-0">{questions.length} questions</span>
        </button>
        <button
          onClick={e => { e.stopPropagation(); setModal("new"); }}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-2 py-1 transition-colors shrink-0 ml-2"
        >
          <Plus className="w-3.5 h-3.5" /> Ajouter
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-100 bg-stone-50 divide-y divide-stone-100">
          {questions.length === 0 ? (
            <div className="px-4 py-4 text-sm text-stone-400 text-center">Aucune question — clique sur "Ajouter" pour en créer une.</div>
          ) : questions.map(q => (
            <div key={q.id} className="flex items-start justify-between px-4 py-3 hover:bg-white transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm text-stone-800 font-medium leading-snug">{q.question}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {(q.options || []).map((opt, i) => (
                    <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${i === q.correct_index ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {String.fromCharCode(65 + i)}: {opt?.slice(0, 30)}{opt?.length > 30 ? "…" : ""}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setModal(q)} className="p-1.5 text-stone-400 hover:text-primary rounded-lg hover:bg-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-stone-400 hover:text-destructive rounded-lg hover:bg-white transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <QuestionModal
          question={modal === "new" ? { theme_number: themeNumber, theme_label: themeLabel, question: "", options: ["", "", ""], correct_index: 0, explanation: "" } : modal}
          onSave={() => { setModal(null); onRefresh(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default function AdminAmfQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTheme, setShowNewTheme] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.AmfQuestion.list("theme_number", 500);
    setQuestions(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Build unique themes in order
  const themes = [];
  const seen = new Set();
  questions.forEach(q => {
    if (!seen.has(q.theme_number)) {
      seen.add(q.theme_number);
      themes.push({ theme_number: q.theme_number, theme_label: q.theme_label });
    }
  });
  themes.sort((a, b) => a.theme_number - b.theme_number);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-900">Questions Certification AMF</h2>
          <p className="text-xs text-stone-500 mt-0.5">{questions.length} questions · {themes.length} thèmes</p>
        </div>
        <DuoButton variant="primary" onClick={() => setShowNewTheme(true)}>
          <Plus className="w-4 h-4 inline mr-1" /> Nouveau thème
        </DuoButton>
      </div>

      {showNewTheme && (
        <QuestionModal
          question={{ theme_number: themes.length + 1, theme_label: "", question: "", options: ["", "", ""], correct_index: 0, explanation: "" }}
          onSave={() => { setShowNewTheme(false); load(); }}
          onClose={() => setShowNewTheme(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-stone-500 py-8"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : themes.map(t => (
        <ThemeRow
          key={t.theme_number}
          themeNumber={t.theme_number}
          themeLabel={t.theme_label}
          questions={questions.filter(q => q.theme_number === t.theme_number)}
          onRefresh={load}
        />
      ))}

      <AdminInspecteurSituations />
    </div>
  );
}