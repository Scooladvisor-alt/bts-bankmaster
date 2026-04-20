import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingPopup from "@/components/popup/FloatingPopup";
import {
  Target,
  Gamepad2,
  Infinity as InfinityIcon,
  ListChecks,
  PenLine,
  BookOpen,
  Link as LinkIcon,
  Bot,
  ChevronLeft,
  Flame,
} from "lucide-react";

const SUBJECT_CONFIG = {
  vojes: {
    name: "VOJES",
    emoji: "📊",
    tagline: "Veille, Organisationnel, Juridique et Sectorielle",
    color: "voges",
    bg: "from-purple-50 to-indigo-50",
    btnClass: "bg-voges",
  },
  cesbf: {
    name: "CESBF",
    emoji: "🏦",
    tagline: "Conseil et Expertise en Solution Bancaire et Financière",
    color: "cesbf",
    bg: "from-orange-50 to-red-50",
    btnClass: "bg-cesbf",
  },
};

const METHODS = [
  { slug: "pareto",     label: "QCM Pareto",          desc: "L'essentiel 20/80",       icon: Target,       color: "bg-yellow-400",  text: "text-yellow-900" },
  { slug: "jeu",        label: "QCM Mode Jeu",         desc: "Cours, choisis, mémorise", icon: Gamepad2,     color: "bg-pink-400",    text: "text-pink-900" },
  { slug: "infini",     label: "QCM Infini",           desc: "Mode hardcore",            icon: InfinityIcon, color: "bg-red-400",     text: "text-red-900" },
  { slug: "questions",  label: "Questions révision",   desc: "Réfléchis puis révèle",    icon: ListChecks,   color: "bg-blue-400",    text: "text-blue-900" },
  { slug: "libre",      label: "Réponse libre",        desc: "Écris, compare",           icon: PenLine,      color: "bg-teal-400",    text: "text-teal-900" },

  { slug: "vraiouFaux", label: "Vrai ou Faux",         desc: "Révise efficacement",      icon: Flame,        color: "bg-rose-500",    text: "text-white" },
  { slug: "cours",      label: "Cours",                desc: "Méthodo & théorie",        icon: BookOpen,     color: "bg-emerald-400", text: "text-emerald-900" },
  { slug: "ressources", label: "Ressources",           desc: "Vidéos, podcasts…",        icon: LinkIcon,     color: "bg-indigo-400",  text: "text-indigo-900" },
];

export default function Subject() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const config = SUBJECT_CONFIG[subject];

  if (!config) {
    return (
      <div className="p-10 text-center">
        Matière inconnue.
        <Link to="/" className="text-primary underline ml-2">Retour</Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.bg} relative`}>
      <FloatingPopup subject={config.name} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-20">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Accueil
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="text-5xl">{config.emoji}</div>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest text-${config.color}`}>
              Matière
            </div>
            <h1 className="font-display text-4xl font-bold text-stone-900">
              {config.name}
            </h1>
            <div className="text-stone-600 text-sm">{config.tagline}</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {METHODS.map((m, i) => {
            const card = (
              <div className={`${m.color} ${m.text} rounded-2xl p-4 md:p-5 shadow-duo border-b-4 border-black/15 h-full flex flex-col items-start hover:-translate-y-0.5 transition-transform`}>
                <m.icon className="w-6 h-6 mb-2" />
                <div className="font-display font-bold text-base md:text-lg leading-tight">
                  {m.label}
                </div>
                <div className="text-xs font-medium opacity-80 mt-0.5">{m.desc}</div>
              </div>
            );
            return (
              <motion.div
                key={m.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/${subject}/${m.slug}`}>{card}</Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bouton Assistant flottant en bas à droite */}
      <Link
        to={`/${subject}/assistant`}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-stone-800 shadow-lg flex items-center justify-center hover:bg-stone-700 transition-colors border-b-4 border-black/30 active:border-b-0 active:translate-y-1"
        title="Assistant — Pose tes questions"
      >
        <Bot className="w-6 h-6 text-white" />
      </Link>
    </div>
  );
}