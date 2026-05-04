import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, RotateCcw, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

// Couleurs par thème (cycle)
const THEME_COLORS = [
  { color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700" },
  { color: "from-blue-500 to-blue-700",     bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700" },
  { color: "from-teal-500 to-emerald-600",  bg: "bg-teal-50",   border: "border-teal-200",   badge: "bg-teal-100 text-teal-700" },
  { color: "from-amber-400 to-orange-500",  bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-700" },
  { color: "from-red-500 to-rose-600",      bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700" },
  { color: "from-indigo-500 to-blue-600",   bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  { color: "from-green-500 to-emerald-600", bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700" },
  { color: "from-pink-500 to-rose-500",     bg: "bg-pink-50",   border: "border-pink-200",   badge: "bg-pink-100 text-pink-700" },
];

import { getCachedUserId } from "@/lib/recordStorage";

function getStorageKey() {
  return `cesbf_programme_checked_v2_u${getCachedUserId()}`;
}

function loadChecked() {
  try { return JSON.parse(localStorage.getItem(getStorageKey())) || {}; } catch { return {}; }
}
function saveChecked(data) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function itemKey(itemId) { return `item_${itemId}`; }

function ThemeSection({ theme, items, colorConfig, checked, onToggle }) {
  const [open, setOpen] = useState(true);

  const notions = items.filter(i => i.type === "notion").sort((a, b) => (a.order || 0) - (b.order || 0));
  const calculs = items.filter(i => i.type === "calcul").sort((a, b) => (a.order || 0) - (b.order || 0));

  const total = notions.length + calculs.length;
  const doneNotions = notions.filter(i => checked[itemKey(i.id)]).length;
  const doneCalculs = calculs.filter(i => checked[itemKey(i.id)]).length;
  const done = doneNotions + doneCalculs;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const { color, bg, border, badge } = colorConfig;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${border} overflow-hidden mb-4 shadow-sm`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${bg} text-left`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${color} shrink-0`} />
          <div className="min-w-0">
            <div className="font-display font-bold text-stone-900 text-sm leading-tight">{theme.theme_title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-24 bg-stone-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-bold text-stone-500">{done}/{total} ({pct}%)</span>
            </div>
          </div>
        </div>
        <span className="text-stone-400 text-lg ml-3">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="bg-white divide-y divide-stone-50">
          {notions.length > 0 && (
            <div className="px-4 py-3">
              <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ${badge}`}>
                📚 Notions ({doneNotions}/{notions.length})
              </div>
              <div className="space-y-2">
                {notions.map(item => {
                  const key = itemKey(item.id);
                  const isChecked = !!checked[key];
                  return (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => onToggle(key)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? "bg-green-500 border-green-500" : "border-stone-300 group-hover:border-green-400"
                        }`}
                      >
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`text-sm leading-relaxed transition-colors ${isChecked ? "line-through text-stone-400" : "text-stone-700"}`}>
                        {item.content}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {calculs.length > 0 && (
            <div className="px-4 py-3">
              <div className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ${badge}`}>
                🔢 Calculs ({doneCalculs}/{calculs.length})
              </div>
              <div className="space-y-2">
                {calculs.map(item => {
                  const key = itemKey(item.id);
                  const isChecked = !!checked[key];
                  return (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => onToggle(key)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? "bg-orange-400 border-orange-400" : "border-stone-300 group-hover:border-orange-300"
                        }`}
                      >
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`text-sm leading-relaxed transition-colors ${isChecked ? "line-through text-stone-400" : "text-stone-700"}`}>
                        {item.content}
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(loadChecked);

  useEffect(() => {
    base44.entities.ProgrammeItem.filter({ subject: "CESBF" }, "theme_order", 2000).then(list => {
      setItems(list || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { saveChecked(checked); }, [checked]);

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const reset = () => {
    if (confirm("Remettre à zéro toute la progression ?")) setChecked({});
  };

  // Grouper par thème
  const themeMap = {};
  items.forEach(item => {
    if (!themeMap[item.theme_id]) themeMap[item.theme_id] = { theme_title: item.theme_title, theme_order: item.theme_order || 0, items: [] };
    themeMap[item.theme_id].items.push(item);
  });
  const themes = Object.entries(themeMap).sort((a, b) => a[1].theme_order - b[1].theme_order);

  const totalAll = items.length;
  const doneAll = items.filter(i => checked[itemKey(i.id)]).length;
  const pctAll = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
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
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
            <div className="flex-1 h-3 bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500" style={{ width: `${pctAll}%` }} />
            </div>
            <span className="text-sm font-bold text-orange-600 shrink-0">{doneAll}/{totalAll} ({pctAll}%)</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
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

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement du programme…
          </div>
        ) : themes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-stone-400 border border-stone-200">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-bold text-stone-600 mb-1">Programme non encore configuré</div>
            <div className="text-sm">Un administrateur ou un professeur doit importer le programme depuis l'espace professeur.</div>
          </div>
        ) : (
          themes.map(([themeId, { theme_title, items: themeItems }], idx) => (
            <ThemeSection
              key={themeId}
              theme={{ theme_id: themeId, theme_title }}
              items={themeItems}
              colorConfig={THEME_COLORS[idx % THEME_COLORS.length]}
              checked={checked}
              onToggle={toggle}
            />
          ))
        )}

        {themes.length > 0 && (
          <div className="mt-4 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-500 leading-relaxed">
            <span className="font-bold">+ Transversal :</span> Diagnostic de la situation du client + Méthodologie d'élaboration de solution d'équipement de compte, d'épargne, de crédit et d'assurance.
          </div>
        )}
      </div>
    </div>
  );
}