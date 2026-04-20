import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Trash2, Edit3, X, Save } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

/*
 * Generic CRUD table.
 * props:
 *   entityName: string ("Question", "Flashcard"…)
 *   fields: [{ key, label, type: "text"|"textarea"|"number"|"select"|"array-options", options?: [] }]
 *   displayColumns: [fieldKey]
 *   defaults: {}
 */
export default function EntityCRUD({ entityName, fields, displayColumns, defaults = {}, subjectFilter = null, extraFilter = {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // object or null
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    setLoading(true);
    let list;
    const filter = { ...(subjectFilter ? { subject: subjectFilter } : {}), ...extraFilter };
    if (Object.keys(filter).length > 0) {
      list = await base44.entities[entityName].filter(filter, "-created_date", 500);
    } else {
      list = await base44.entities[entityName].list("-created_date", 500);
    }
    setItems(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, [entityName, subjectFilter, JSON.stringify(extraFilter)]);

  const startNew = () => {
    const init = { ...defaults, ...extraFilter };
    if (subjectFilter) init.subject = subjectFilter;
    setEditing(init);
    setIsNew(true);
  };
  const startEdit = (item) => { setEditing({ ...item }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = async () => {
    const { id, created_date, updated_date, created_by, ...payload } = editing;
    if (isNew) await base44.entities[entityName].create(payload);
    else await base44.entities[entityName].update(id, payload);
    cancel();
    load();
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await base44.entities[entityName].delete(id);
    load();
  };

  const update = (key, value) => setEditing((e) => ({ ...e, [key]: value }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-stone-500 font-bold">{items.length} élément(s)</div>
        <DuoButton variant="primary" onClick={startNew}>
          <Plus className="w-4 h-4 inline mr-1" /> Ajouter
        </DuoButton>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                {displayColumns.map((c) => (
                  <th key={c} className="text-left px-3 py-2 font-bold uppercase text-[11px] tracking-widest">{c}</th>
                ))}
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50">
                  {displayColumns.map((c) => (
                    <td key={c} className="px-3 py-2 align-top">
                      <div className="max-w-xs truncate">{formatCell(item[c])}</div>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => startEdit(item)} className="p-1.5 text-stone-500 hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => remove(item.id)} className="p-1.5 text-stone-500 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={displayColumns.length + 1} className="text-center py-6 text-stone-400">Aucun élément</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={cancel}>
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold">{isNew ? "Nouveau" : "Modifier"}</h3>
              <button onClick={cancel} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {fields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={editing[f.key]}
                  onChange={(v) => update(f.key, v)}
                  full={editing}
                  locked={(f.key === "subject" && !!subjectFilter) || f.locked}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <DuoButton variant="ghost" onClick={cancel}>Annuler</DuoButton>
              <DuoButton variant="primary" onClick={save}><Save className="w-4 h-4 inline mr-1" /> Enregistrer</DuoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCell(v) {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.join(" | ");
  if (typeof v === "string" && v.length > 80) return v.slice(0, 80) + "…";
  return String(v);
}

function FieldEditor({ field, value, onChange, full, locked = false }) {
  const base = "w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:border-primary";
  if (field.type === "textarea") {
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
        <textarea className={`${base} min-h-[100px]`} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === "select") {
    if (locked) {
      return (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
          <div className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-stone-500 text-sm">{value} <span className="text-xs">(verrouillé)</span></div>
        </div>
      );
    }
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
        <select className={base} value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options.map((o) => (<option key={o} value={o}>{o}</option>))}
        </select>
      </div>
    );
  }
  if (field.type === "number") {
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
        <input type="number" className={base} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
      </div>
    );
  }
  if (field.type === "array-options") {
    const arr = Array.isArray(value) ? value : ["", "", "", ""];
    return (
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
        <div className="space-y-2">
          {arr.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${full?.correct_index === i ? "bg-green-500 text-white" : "bg-stone-200"}`}>
                {String.fromCharCode(65 + i)}
              </div>
              <input
                className={base}
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const next = [...arr]; next[i] = e.target.value; onChange(next);
                }}
              />
            </div>
          ))}
        </div>
        <div className="text-[11px] text-stone-500 mt-1">Définis la bonne réponse via le champ "Index correct" ci-dessous.</div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500">{field.label}</label>
      <input className={base} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}