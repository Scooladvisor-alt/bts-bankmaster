import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Video, Headphones, Workflow, Link as LinkIcon, ExternalLink } from "lucide-react";

const ICONS = {
  video: Video,
  podcast: Headphones,
  diagramme: Workflow,
  lien: LinkIcon,
};
const COLORS = {
  video: "bg-red-100 text-red-600",
  podcast: "bg-purple-100 text-purple-600",
  diagramme: "bg-amber-100 text-amber-700",
  lien: "bg-indigo-100 text-indigo-600",
};

export default function Resources({ subject }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setItems(await base44.entities.Resource.filter({ subject }));
      setLoading(false);
    })();
  }, [subject]);

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  if (items.length === 0) return <div className="bg-white rounded-2xl p-6 text-center text-stone-600">Aucune ressource.</div>;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((r) => {
        const Icon = ICONS[r.type] || LinkIcon;
        return (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl p-4 shadow-duo border-b-4 border-indigo-200 hover:-translate-y-0.5 transition-transform flex gap-3 items-start"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLORS[r.type] || COLORS.lien}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-stone-900 flex items-center gap-1">
                {r.title} <ExternalLink className="w-3 h-3 text-stone-400" />
              </div>
              {r.description && <div className="text-sm text-stone-500">{r.description}</div>}
              <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 mt-1">{r.type}</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}