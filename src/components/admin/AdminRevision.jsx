import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Edit3, X, Save } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import ChapterSelect from "./ChapterSelect";

const base = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";

function RevisionModal({ item, subject, onSave, onClose }) {
  const [form, setForm] = useState(item || {
    subject: subject || "VOJES",
    chapter: "",
    question: "",
    expected_answer: "",
    type: "mentale",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = form;
    if (id) await base44.entities.RevisionQuestion.update(id, payload);
    else await base44.entities.RevisionQuestion.create(payload);

    // Log si c'est une création
    if (!id) {
      try {
        const user = await base44.auth.me();
        await base44.entities.QuestionLog.create({
          action: "create",
          entityType: "Révision",
          questionText: form.question,
          subject: form.subject,
          chapter: form.chapter,
          authorName: user?.full_name || "",
          authorEmail: user?.email || "",
          seen: false,
        });
      } catch {}
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl font-bold">{form.id ? "Modifier" : "Nouvelle question"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500" /></button>
        </div>

        <div className="space-y-4">
          <ChapterSelect subject={form.subject} value={form.chapter} onChange={(v) => update("chapter", v)} />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Question</label>
            <textarea className={`${base} min-h-[80px]`} value={form.question} onChange={(e) => update("question", e.target.value)} placeholder="Posez la question…" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Réponse attendue</label>
            <textarea className={`${base} min-h-[80px]`} value={form.expected_answer} onChange={(e) => update("expected_answer", e.target.value)} placeholder="Réponse modèle…" />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <DuoButton variant="ghost" onClick={onClose}>Annuler</DuoButton>
          <DuoButton variant="primary" onClick={save}><Save className="w-4 h-4 inline mr-1" /> Enregistrer</DuoButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminRevision({ subjectFilter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.RevisionQuestion.filter({ subject: subjectFilter || "VOJES" }, null, 500);
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [subjectFilter]);

  const remove = async (item) => {
    if (!confirm("Supprimer cette question ?")) return;
    await base44.entities.RevisionQuestion.delete(item.id);
    try {
      const user = await base44.auth.me();
      await base44.entities.QuestionLog.create({
        action: "delete",
        entityType: "Révision",
        questionText: item.question,
        subject: item.subject,
        chapter: item.chapter,
        authorName: user?.full_name || "",
        authorEmail: user?.email || "",
        seen: false,
      });
    } catch {}
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-stone-500 font-bold">{items.length} question(s)</div>
        <DuoButton variant="primary" onClick={() => setModal({})}>
          <Plus className="w-4 h-4 inline mr-1" /> Ajouter
        </DuoButton>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-3 py-2 font-bold uppercase text-[11px] tracking-widest text-stone-500">Chapitre</th>
                <th className="text-left px-3 py-2 font-bold uppercase text-[11px] tracking-widest text-stone-500">Question</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-3 py-2 text-xs text-stone-500 align-top w-48">{item.chapter || "—"}</td>
                  <td className="px-3 py-2 align-top">
                    <div className="max-w-sm truncate text-stone-800">{item.question}</div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setModal(item)} className="p-1.5 text-stone-500 hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => remove(item)} className="p-1.5 text-stone-500 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="text-center py-6 text-stone-400">Aucune question</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <RevisionModal
          item={modal?.id ? modal : null}
          subject={subjectFilter || "VOJES"}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}