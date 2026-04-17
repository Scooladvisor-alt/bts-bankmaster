import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";
import { saveFreeAnswer } from "@/lib/localProgress";

function normalize(s = "") {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function similarity(a, b) {
  const A = new Set(normalize(a).split(" ").filter((w) => w.length > 2));
  const B = new Set(normalize(b).split(" ").filter((w) => w.length > 2));
  if (A.size === 0 || B.size === 0) return 0;
  let hit = 0;
  A.forEach((w) => B.has(w) && hit++);
  return hit / Math.max(A.size, B.size);
}

export default function FreeAnswer({ subject }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [sim, setSim] = useState(0);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.RevisionQuestion.filter({ subject, type: "libre" });
      const all = list.length ? list : await base44.entities.RevisionQuestion.filter({ subject });
      setItems(all);
      setLoading(false);
    })();
  }, [subject]);

  const current = items[idx];

  const reveal = () => {
    setRevealed(true);
    setSim(similarity(answer, current.expected_answer));
    saveFreeAnswer(subject, current.id, answer);
  };
  const next = () => { setIdx((i) => (i + 1) % items.length); setAnswer(""); setRevealed(false); setSim(0); };

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (items.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune question.</div>;

  const pct = Math.round(sim * 100);
  const tone = pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-red-500";

  return (
    <div>
      <div className="text-sm text-stone-500 font-bold mb-3">{idx + 1} / {items.length}</div>
      <div className="bg-white rounded-3xl p-6 shadow-duo-lg border-b-4 border-teal-300">
        {current.chapter && <div className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{current.chapter}</div>}
        <h2 className="font-display text-xl font-bold mt-1">{current.question}</h2>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={revealed}
          placeholder="Écris ta réponse ici…"
          className="mt-4 w-full rounded-2xl border-2 border-teal-200 bg-teal-50/40 p-3 min-h-[130px] focus:outline-none focus:border-teal-500 font-medium"
        />

        {!revealed ? (
          <div className="flex justify-end mt-3">
            <DuoButton variant="primary" onClick={reveal} disabled={!answer.trim()}>
              Révéler la réponse
            </DuoButton>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Correspondance approximative : <span className={tone}>{pct}%</span>
            </div>
            <div className="bg-teal-50 rounded-2xl p-4 border-l-4 border-teal-500">
              <div className="text-[10px] uppercase tracking-widest text-teal-700 font-bold mb-1">Réponse attendue</div>
              <div className="whitespace-pre-wrap text-stone-800">{current.expected_answer}</div>
            </div>
            <div className="flex justify-end">
              <DuoButton variant="primary" onClick={next}>
                Suivante <ChevronRight className="w-4 h-4 inline" />
              </DuoButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}