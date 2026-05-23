import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen } from "lucide-react";

const MODULES = [
  {
    slug: "vocabulaire",
    label: "Vocabulaire",
    desc: "150 mots business : flashcards, QCM, écriture",
    icon: "📘",
    color: "bg-sky-400",
    text: "text-white",
  },
];

export default function Anglais() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-6 py-2 pr-3"
        >
          <ChevronLeft className="w-4 h-4" /> Accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-400 shadow-duo shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-sky-500">
              Matière
            </div>
            <h1 className="font-display text-4xl font-bold text-stone-900">
              Anglais
            </h1>
            <div className="text-stone-600 text-sm">Business English — Vocabulaire & Grammaire</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/anglais/${m.slug}`}>
                <div className={`${m.color} ${m.text} rounded-2xl p-4 md:p-5 shadow-duo border-b-4 border-black/15 h-full flex flex-col items-start hover:-translate-y-0.5 transition-transform`}>
                  <span className="text-2xl mb-2">{m.icon}</span>
                  <div className="font-display font-bold text-base md:text-lg leading-tight">
                    {m.label}
                  </div>
                  <div className="text-xs font-medium opacity-80 mt-0.5">{m.desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}