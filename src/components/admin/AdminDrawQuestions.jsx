import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Edit3, X, Save } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

const SUBJECTS = ["VOJES", "CESBF"];

function Modal({ item, onSave, onClose, defaultSubject }) {
  const [form, setForm] = useState(item || { subject: defaultSubject || "CESBF", prompt: "", answer: "", order: 0 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = form;
    if (id) await base44.entities.DrawQuestion.update(id, payload);
    else await base44.entities.DrawQuestion.create(payload);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold">{form.id ? "Modifier" : "Nouvelle question"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Matière</label>
            <select className="w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary"
              value={form.subject} onChange={e => set("subject", e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Indice (question)</label>
            <textarea className="w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary min-h-[80px] text-sm"
              value={form.prompt} onChange={e => set("prompt", e.target.value)}
              placeholder="Ex: Délai de rétractation crédit conso (jours)" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Réponse à tracer (modèle)</label>
            <input className="w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary font-bold text-lg"
              value={form.answer} onChange={e => set("answer", e.target.value)}
              placeholder="Ex: 14 jours" />
            <p className="text-[10px] text-stone-400 mt-1">Ce texte sera affiché en grand comme modèle à retracer.</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Ordre d'affichage</label>
            <input type="number" className="w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary"
              value={form.order} onChange={e => set("order", Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <DuoButton variant="ghost" onClick={onClose}>Annuler</DuoButton>
          <DuoButton variant="primary" onClick={handleSave}><Save className="w-4 h-4 inline mr-1" /> Enregistrer</DuoButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminDrawQuestions({ subjectFilter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | item

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.DrawQuestion.filter(
      subjectFilter ? { subject: subjectFilter } : {},
      "order",
      500
    );
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [subjectFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    await base44.entities.DrawQuestion.delete(id);
    load();
  };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-stone-500 font-bold">{items.length} question(s) de traçage pour retenir les chiffres clés — {subjectFilter}</div>
        <DuoButton variant="primary" onClick={() => setModal("new")}>
          <Plus className="w-4 h-4 inline mr-1" /> Ajouter
        </DuoButton>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200">
          Aucune question de traçage pour cette matière.<br />
          <span className="text-xs">Clique sur "Ajouter" pour en créer une.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-stone-200 px-4 py-3 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-stone-600 leading-snug mb-1">{item.prompt}</div>
                <div className="inline-block bg-violet-100 text-violet-700 font-bold text-base px-3 py-1 rounded-xl">
                  ✏️ {item.answer}
                </div>
              </div>
              <div className="flex gap-1 shrink-0 mt-1">
                <button onClick={() => setModal(item)} className="p-1.5 text-stone-400 hover:text-primary rounded-lg hover:bg-stone-100 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-stone-400 hover:text-destructive rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          item={modal === "new" ? null : modal}
          defaultSubject={subjectFilter}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}