import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Edit3, X, Save, CheckCircle, XCircle } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import ChapterSelect from "./ChapterSelect";

const base = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";

function VraiOuFauxModal({ item, subject, onSave, onClose }) {
  // Parse existing: front = affirmation, back = "VRAI — explication" ou "FAUX — explication"
  const parseBack = (back) => {
    if (!back) return { verdict: "", explication: "" };
    const upper = back.toUpperCase();
    if (upper.startsWith("VRAI")) return { verdict: "VRAI", explication: back.replace(/^vrai\s*[—\-:]\s*/i, "").trim() };
    if (upper.startsWith("FAUX")) return { verdict: "FAUX", explication: back.replace(/^faux\s*[—\-:]\s*/i, "").trim() };
    return { verdict: "", explication: back };
  };

  const parsed = parseBack(item?.back);
  const [form, setForm] = useState({
    subject: subject || "VOJES",
    chapter: item?.chapter || "",
    front: item?.front || "",
    verdict: parsed.verdict,
    explication: parsed.explication,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const back = form.verdict
      ? `${form.verdict}${form.explication ? ` — ${form.explication}` : ""}`
      : form.explication;

    const payload = { subject: form.subject, chapter: form.chapter, front: form.front, back };
    if (item?.id) await base44.entities.Flashcard.update(item.id, payload);
    else await base44.entities.Flashcard.create(payload);

    if (!item?.id) {
      try {
        const user = await base44.auth.me();
        await base44.entities.QuestionLog.create({
          action: "create",
          entityType: "Vrai ou Faux",
          questionText: form.front,
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
          <h3 className="font-display text-2xl font-bold">{item?.id ? "Modifier" : "Nouvelle affirmation"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500" /></button>
        </div>

        <div className="space-y-4">
          <ChapterSelect subject={form.subject} value={form.chapter} onChange={(v) => update("chapter", v)} />

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Affirmation</label>
            <textarea className={`${base} min-h-[80px]`} value={form.front} onChange={(e) => update("front", e.target.value)} placeholder="Saisir l'affirmation à évaluer…" />
          </div>

          {/* Verdict VRAI / FAUX */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">Cette affirmation est…</label>
            <div className="flex gap-3">
              <button
                onClick={() => update("verdict", "VRAI")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                  form.verdict === "VRAI"
                    ? "bg-green-500 text-white border-green-500 shadow-md"
                    : "border-stone-200 text-stone-500 hover:border-green-300 hover:text-green-600"
                }`}
              >
                <CheckCircle className="w-5 h-5" /> VRAI
              </button>
              <button
                onClick={() => update("verdict", "FAUX")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                  form.verdict === "FAUX"
                    ? "bg-red-500 text-white border-red-500 shadow-md"
                    : "border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-500"
                }`}
              >
                <XCircle className="w-5 h-5" /> FAUX
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Explication (optionnel)</label>
            <textarea className={`${base} min-h-[70px]`} value={form.explication} onChange={(e) => update("explication", e.target.value)} placeholder="Pourquoi c'est vrai / faux…" />
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

export default function AdminVraiOuFaux({ subjectFilter }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.Flashcard.filter({ subject: subjectFilter || "VOJES" }, null, 500);
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [subjectFilter]);

  const remove = async (item) => {
    if (!confirm("Supprimer cette affirmation ?")) return;
    await base44.entities.Flashcard.delete(item.id);
    try {
      const user = await base44.auth.me();
      await base44.entities.QuestionLog.create({
        action: "delete",
        entityType: "Vrai ou Faux",
        questionText: item.front,
        subject: item.subject,
        chapter: item.chapter,
        authorName: user?.full_name || "",
        authorEmail: user?.email || "",
        seen: false,
      });
    } catch {}
    load();
  };

  const getVerdict = (back) => {
    if (!back) return null;
    if (back.toUpperCase().startsWith("VRAI")) return "VRAI";
    if (back.toUpperCase().startsWith("FAUX")) return "FAUX";
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-stone-500 font-bold">{items.length} affirmation(s)</div>
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
                <th className="text-left px-3 py-2 font-bold uppercase text-[11px] tracking-widest text-stone-500 w-24">Verdict</th>
                <th className="text-left px-3 py-2 font-bold uppercase text-[11px] tracking-widest text-stone-500">Affirmation</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const verdict = getVerdict(item.back);
                return (
                  <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="px-3 py-2 align-top">
                      {verdict === "VRAI" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">✓ VRAI</span>}
                      {verdict === "FAUX" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">✗ FAUX</span>}
                      {!verdict && <span className="text-stone-400 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="max-w-sm truncate text-stone-800">{item.front}</div>
                      <div className="text-xs text-stone-400 truncate">{item.chapter}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => setModal(item)} className="p-1.5 text-stone-500 hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(item)} className="p-1.5 text-stone-500 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={3} className="text-center py-6 text-stone-400">Aucune affirmation</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <VraiOuFauxModal
          item={modal?.id ? modal : null}
          subject={subjectFilter || "VOJES"}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}