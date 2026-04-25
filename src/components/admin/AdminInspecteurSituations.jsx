import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Edit3, Trash2, X, Save } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

function SituationModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || { situation: "", verdict: "CONFORME", explication: "", order: 0 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = form;
    if (id) await base44.entities.AmfInspecteurSituation.update(id, payload);
    else await base44.entities.AmfInspecteurSituation.create(payload);
    onSave();
  };

  const inputCls = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary text-sm";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">{form.id ? "Modifier la situation" : "Nouvelle situation"}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-stone-500" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Situation (ce que dit le banquier)</label>
            <textarea className={`${inputCls} min-h-[100px]`} value={form.situation} onChange={e => set("situation", e.target.value)} placeholder="Ex: &quot;J'ai informé le client de ma déclaration TRACFIN...&quot;" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Verdict</label>
            <div className="flex gap-3">
              {["CONFORME", "SANCTION"].map(v => (
                <button key={v} onClick={() => set("verdict", v)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${form.verdict === v
                    ? v === "CONFORME" ? "bg-green-500 text-white border-green-600" : "bg-red-500 text-white border-red-600"
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"}`}>
                  {v === "CONFORME" ? "✅ CONFORME" : "🚫 SANCTION"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Explication (affichée après la réponse)</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={form.explication} onChange={e => set("explication", e.target.value)} placeholder="Pourquoi c'est conforme ou une faute..." />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Ordre d'affichage</label>
            <input type="number" className={inputCls} value={form.order} onChange={e => set("order", Number(e.target.value))} />
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

export default function AdminInspecteurSituations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.AmfInspecteurSituation.list("order", 100);
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette situation ?")) return;
    await base44.entities.AmfInspecteurSituation.delete(id);
    load();
  };

  return (
    <div className="mt-8 pt-6 border-t-2 border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            🕵️ Mode Inspecteur AMF
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">{items.length} situation(s) — Conforme ou Sanction ?</p>
        </div>
        <DuoButton variant="primary" onClick={() => setModal("new")}>
          <Plus className="w-4 h-4 inline mr-1" /> Ajouter une situation
        </DuoButton>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-stone-500 py-6"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : items.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center text-stone-400 border border-slate-200">
          Aucune situation — clique sur "Ajouter une situation" pour en créer une.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-stone-200 px-4 py-3 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.verdict === "CONFORME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.verdict}
                  </span>
                  <span className="text-xs text-stone-400">#{item.order}</span>
                </div>
                <p className="text-sm text-stone-700 italic leading-snug mb-1">{item.situation}</p>
                {item.explication && <p className="text-xs text-stone-400 leading-snug">{item.explication}</p>}
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
        <SituationModal
          item={modal === "new" ? null : modal}
          onSave={() => { setModal(null); load(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}