import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, ExternalLink, Loader2 } from "lucide-react";
import DuoButton from "@/components/ui-duo/DuoButton";

export default function AssistantLauncher({ subject }) {
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.AssistantLink.filter({ subject });
      setLink(list[0] || null);
      setLoading(false);
    })();
  }, [subject]);

  if (loading) return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-700 text-white rounded-3xl p-8 text-center shadow-duo-lg">
      <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Bot className="w-10 h-10" />
      </div>
      <h2 className="font-display text-3xl font-bold">Ton assistant {subject}</h2>
      <p className="text-white/80 mt-2 text-sm">
        Ouvre une session avec un assistant IA personnalisé pour poser tes questions.
      </p>
      {link ? (
        <a href={link.url} target="_blank" rel="noreferrer" className="inline-block mt-6">
          <DuoButton variant="secondary">
            Parler à l'assistant <ExternalLink className="w-4 h-4 inline ml-1" />
          </DuoButton>
        </a>
      ) : (
        <div className="mt-6 text-white/70 text-sm">Aucun lien configuré. L'ajoute depuis l'admin.</div>
      )}
    </div>
  );
}