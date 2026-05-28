import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingPopup from "@/components/popup/FloatingPopup";
import NavAuth from "@/components/landing/NavAuth";
import {
  BarChart2, Landmark, BookOpen, Globe, Target, Gamepad2,
  Infinity as InfinityIcon, ListChecks, PenLine, Bot, Pen,
  Brain, FileText, Headphones, Map, CheckCircle, Star,
  Zap, Shield, TrendingUp, Award, ChevronRight, Sparkles,
  RefreshCcw
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  {
    to: "/vojes",
    label: "VOJES",
    fullName: "Veille, Organisationnel, Juridique & Sectoriel",
    gradient: "from-purple-500 to-indigo-600",
    border: "border-purple-700",
    badge: "bg-purple-100 text-purple-700",
    Icon: BarChart2,
    features: [
      { icon: Target,       label: "QCM Pareto 20/80" },
      { icon: Gamepad2,     label: "Mode Jeu voiture" },
      { icon: InfinityIcon, label: "QCM Infini hardcore" },
      { icon: ListChecks,   label: "Questions révision" },
      { icon: PenLine,      label: "Réponse libre IA" },
      { icon: Brain,        label: "Flashcards" },
      { icon: FileText,     label: "10 ans de sujets (2016→2026)" },
      { icon: Bot,          label: "GPT spécialisé VOJES" },
      { icon: Headphones,   label: "Podcasts & ressources" },
      { icon: Map,          label: "Fiches de révision" },
    ],
  },
  {
    to: "/cesbf",
    label: "CESBF",
    fullName: "Conseil & Expertise en Solutions Bancaires & Financières",
    gradient: "from-orange-400 to-red-500",
    border: "border-orange-700",
    badge: "bg-orange-100 text-orange-700",
    Icon: Landmark,
    features: [
      { icon: Target,       label: "QCM Pareto 20/80" },
      { icon: Gamepad2,     label: "Mode Jeu voiture" },
      { icon: InfinityIcon, label: "QCM Infini hardcore" },
      { icon: ListChecks,   label: "Questions révision" },
      { icon: PenLine,      label: "Réponse libre IA" },
      { icon: Brain,        label: "Flashcards" },
      { icon: Award,        label: "Certif AMF incluse 🎁" },
      { icon: FileText,     label: "10 ans de sujets (2016→2026)" },
      { icon: Bot,          label: "GPT spécialisé CESBF" },
      { icon: Headphones,   label: "Podcasts & ressources" },
    ],
  },
  {
    to: "/anglais",
    label: "Anglais",
    fullName: "Business English — Vocabulaire & Expression",
    gradient: "from-sky-400 to-blue-600",
    border: "border-sky-700",
    badge: "bg-sky-100 text-sky-700",
    Icon: BookOpen,
    features: [
      { icon: Brain,        label: "150 flashcards métier" },
      { icon: Target,       label: "QCM de traduction" },
      { icon: Pen,          label: "Exercices d'écriture" },
      { icon: TrendingUp,   label: "Suivi de progression" },
      { icon: Zap,          label: "Mode express" },
      { icon: Map,          label: "Lexique par catégorie" },
    ],
  },
  {
    to: "/culture-generale",
    label: "Culture Générale",
    fullName: "Actualités, histoire & questions de société",
    gradient: "from-amber-400 to-orange-500",
    border: "border-amber-700",
    badge: "bg-amber-100 text-amber-700",
    Icon: Globe,
    features: [
      { icon: FileText,     label: "Fiches thématiques" },
      { icon: Target,       label: "QCM d'entraînement" },
      { icon: Brain,        label: "Flashcards culture" },
      { icon: Sparkles,     label: "Contenu bientôt disponible" },
    ],
    soon: true,
  },
];

const METHODS = [
  { icon: Target,       label: "QCM Pareto",       desc: "La méthode 20/80 : apprends l'essentiel en priorité.", color: "bg-yellow-50 border-yellow-200" },
  { icon: Gamepad2,     label: "Jeu voiture",       desc: "Révise en conduisant et en choisissant la bonne voie.", color: "bg-pink-50 border-pink-200" },
  { icon: InfinityIcon, label: "QCM Infini",        desc: "Mode hardcore : enchaîne les questions sans limite.", color: "bg-red-50 border-red-200" },
  { icon: Brain,        label: "Flashcards",        desc: "Mémorise avec le système de cartes recto-verso.", color: "bg-blue-50 border-blue-200" },
  { icon: PenLine,      label: "Réponse libre IA",  desc: "L'IA évalue ta rédaction et te donne un feedback.", color: "bg-teal-50 border-teal-200" },
  { icon: Pen,          label: "Mémo Dessin",       desc: "Trace pour mémoriser : schémas et formules.", color: "bg-violet-50 border-violet-200" },
  { icon: ListChecks,   label: "Révision mentale",  desc: "Questions ouvertes, réfléchis puis révèle la réponse.", color: "bg-green-50 border-green-200" },
  { icon: Bot,          label: "Assistant GPT",     desc: "Pose tes questions à un GPT spécialisé par matière.", color: "bg-stone-50 border-stone-200" },
];

const TESTIMONIALS = [
  { name: "Mathis R.", score: "17/20 à VOJES", text: "Le mode jeu voiture m'a permis de mémoriser sans m'en rendre compte. Les QCM Pareto sont ultra efficaces.", stars: 5 },
  { name: "Léa M.", score: "Mention TB", text: "La certif AMF incluse dans CESBF, c'est un vrai plus. J'ai validé ma certif en 3 semaines grâce à la plateforme.", stars: 5 },
  { name: "Antoine D.", score: "Admis BTS Banque", text: "Les 10 ans de sujets avec l'analyseur IA, ça m'a donné une vision claire de ce qui tombe vraiment à l'examen.", stars: 5 },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-nunito overflow-x-hidden">
      <FloatingPopup subject="ALL" />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="font-display font-bold text-xl text-stone-900">BTS Banque Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-stone-500">
            <a href="#matieres" className="hover:text-stone-900 transition-colors">Matières</a>
            <a href="#methodes" className="hover:text-stone-900 transition-colors">Méthodes</a>
            <a href="#tarifs" className="hover:text-stone-900 transition-colors">Tarifs</a>
          </div>
          <NavAuth />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-green-950 text-white pt-20 pb-28 px-6">
        {/* Déco blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Révise{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                intelligemment.
              </span>
              <br />
              Décroche ton BTS.
            </h1>

            <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              La plateforme <strong className="text-white">100% dédiée aux étudiants BTS Banque</strong> — 
              programme officiel, 10 ans de sujets, 8 méthodes d'apprentissage, certif AMF incluse.
              <br />
              <span className="text-green-400 font-bold">Admis ou remboursé.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#tarifs">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-primary text-white font-display font-bold text-lg px-8 py-4 rounded-2xl shadow-lg border-b-4 border-green-700 hover:bg-green-500 transition-colors"
                >
                  Commencer — dès 39€/mois →
                </motion.button>
              </a>
              <a href="#matieres" className="text-stone-300 font-bold text-sm hover:text-white transition-colors flex items-center gap-1">
                Voir le contenu <ChevronRight className="w-4 h-4" />
              </a>
            </div>


          </motion.div>
        </div>
      </section>

      {/* ── BADGE GARANTIE ── */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-white text-sm font-bold">
          <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> Admis ou remboursé — garantie 30 jours</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Basé sur le programme officiel de l'Éducation Nationale</div>
          <div className="flex items-center gap-2"><RefreshCcw className="w-5 h-5" /> Mise à jour continue du contenu</div>
        </div>
      </div>

      {/* ── MATIÈRES ── */}
      <section id="matieres" className="py-20 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              Contenu complet
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-3">
              Tout le programme BTS Banque
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Chaque matière dispose de son propre espace avec des dizaines d'heures de contenu structuré.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {SUBJECTS.map((subj, i) => (
              <motion.div
                key={subj.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={subj.to}>
                  <div className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                    {/* Header matière */}
                    <div className={`bg-gradient-to-br ${subj.gradient} p-6 relative`}>
                      {subj.soon && (
                        <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Bientôt
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <subj.Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-display font-bold text-white text-2xl leading-tight">{subj.label}</div>
                          <div className="text-white/80 text-xs font-medium">{subj.fullName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-2">
                        {subj.features.map((feat, j) => (
                          <div key={j} className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${subj.badge}`}>
                              <feat.icon className="w-3 h-3" />
                            </div>
                            {feat.label}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-end text-xs font-bold text-stone-400 group-hover:text-primary transition-colors">
                        Accéder <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTHODES ── */}
      <section id="methodes" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              8 méthodes d'apprentissage
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-3">
              Chaque cerveau apprend différemment
            </h2>
            <p className="text-stone-500 text-lg max-w-2xl mx-auto">
              Flashcards, jeux, QCM, IA… Tu choisis ta méthode. La plateforme s'adapte.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METHODS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`${m.color} border rounded-2xl p-4 hover:-translate-y-1 transition-transform`}
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <m.icon className="w-5 h-5 text-stone-700" />
                </div>
                <div className="font-display font-bold text-stone-900 text-sm mb-1">{m.label}</div>
                <div className="text-stone-500 text-xs leading-snug">{m.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMF BONUS ── */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-950 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold mb-5">
              🎁 BONUS EXCLUSIF CESBF
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Certif AMF incluse dans CESBF
            </h2>
            <p className="text-blue-200 text-base leading-relaxed mb-6">
              La Certification AMF est obligatoire dans le secteur bancaire. 
              Notre module dédié avec 12 thèmes, des centaines de questions et un simulateur d'examen 
              te prépare à la valider dès ton BTS.
            </p>
            <div className="flex flex-wrap gap-3">
              {["12 thèmes officiels", "Simulateur d'examen", "L'Inspecteur AMF (jeu)", "Questions réelles"].map(tag => (
                <div key={tag} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-blue-100">
                  ✓ {tag}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 border border-white/20 rounded-3xl p-8 text-center min-w-[220px]"
          >
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-display text-2xl font-bold mb-1">Certif AMF</div>
            <div className="text-blue-300 text-sm mb-4">Incluse dans CESBF</div>
            <Link to="/cesbf/amf">
              <button className="bg-yellow-400 text-stone-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
                Voir le module →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-20 px-6 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">
              Ils ont décroché leur BTS 🎓
            </h2>
            <p className="text-stone-500">Des étudiants qui ont utilisé la plateforme et réussi leur examen.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-stone-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-bold text-stone-900 text-sm">{t.name}</div>
                  <div className="text-primary text-xs font-semibold">{t.score}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              Admis ou remboursé
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-3">
              Un accès simple, transparent
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Pas de surprise. Annule quand tu veux. Remboursé si tu n'es pas admis.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Essentiel 29€ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-8 flex flex-col"
            >
              <div className="font-display text-xl font-bold text-stone-900 mb-1">Essentiel</div>
              <div className="text-stone-500 text-sm mb-6">VOJES + CESBF uniquement</div>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-stone-900">29€</span>
                <span className="text-stone-400 font-semibold">/mois</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "VOJES — programme complet",
                  "CESBF — programme complet",
                  "Certif AMF incluse",
                  "8 méthodes d'apprentissage",
                  "10 ans de sujets",
                  "GPT spécialisé par matière",
                  "Garantie admis ou remboursé",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
                {["Anglais Business", "Culture Générale"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-300 text-sm line-through">
                    <CheckCircle className="w-4 h-4 text-stone-200 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/vojes">
                <button className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3.5 rounded-2xl transition-colors">
                  Commencer — 29€/mois
                </button>
              </Link>
            </motion.div>

            {/* Mensuel complet */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-8 flex flex-col"
            >
              <div className="font-display text-xl font-bold text-stone-900 mb-1">Accès mensuel</div>
              <div className="text-stone-500 text-sm mb-6">Résilie à tout moment</div>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-stone-900">39€</span>
                <span className="text-stone-400 font-semibold">/mois</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Accès à toutes les matières",
                  "8 méthodes d'apprentissage",
                  "Certif AMF incluse",
                  "10 ans de sujets",
                  "GPT spécialisé par matière",
                  "Mises à jour incluses",
                  "Garantie admis ou remboursé",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/vojes">
                <button className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3.5 rounded-2xl transition-colors">
                  Commencer maintenant
                </button>
              </Link>
            </motion.div>

            {/* À vie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-b from-stone-900 to-stone-800 border-2 border-primary rounded-3xl p-8 flex flex-col shadow-2xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-bold text-xs px-4 py-1.5 rounded-full shadow">
                ⚡ MEILLEURE OFFRE
              </div>
              <div className="font-display text-xl font-bold text-white mb-1">Accès à vie</div>
              <div className="text-stone-400 text-sm mb-6">Paiement unique — accès permanent</div>
              <div className="mb-2">
                <span className="font-display text-5xl font-black text-white">79€</span>
                <span className="text-stone-400 font-semibold"> une fois</span>
              </div>
              <div className="text-green-400 text-sm font-bold mb-6">
                Économise par rapport au mensuel → accès illimité
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Tout de l'offre mensuelle",
                  "Accès à vie, pas d'abonnement",
                  "Contenu mis à jour à vie",
                  "Accès aux futures matières",
                  "Support prioritaire",
                  "Garantie admis ou remboursé",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-stone-200 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/vojes">
                <button className="w-full bg-primary hover:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-colors border-b-4 border-green-700 active:border-b-0 active:translate-y-1">
                  Accès à vie — 79€ →
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Garantie */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center max-w-xl mx-auto"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-display font-bold text-green-900 text-lg mb-1">Garantie Admis ou Remboursé</div>
            <p className="text-green-700 text-sm mb-3">
              Si tu utilises la plateforme sérieusement et que tu n'obtiens pas ton BTS Banque, 
              on te rembourse intégralement.
            </p>
            <details className="text-left bg-white border border-green-200 rounded-xl overflow-hidden">
              <summary className="px-4 py-2.5 text-xs font-bold text-green-800 cursor-pointer hover:bg-green-50 transition-colors select-none">
                📋 Conditions de la garantie (cliquer pour lire)
              </summary>
              <div className="px-4 py-3 text-xs text-stone-600 leading-relaxed space-y-2 border-t border-green-100">
                <p><strong>Condition d'utilisation sérieuse :</strong> Pour bénéficier du remboursement, l'étudiant doit avoir utilisé la plateforme de manière active pendant au minimum <strong>1 heure cumulée</strong> (temps de session enregistré) au cours de son abonnement. En deçà de ce seuil, la demande de remboursement ne pourra pas être accordée.</p>
                <p><strong>Preuve d'échec :</strong> L'étudiant doit fournir une preuve officielle de non-admission à son BTS Banque (relevé de notes ou attestation de résultats).</p>
                <p><strong>Délai de demande :</strong> La demande doit être effectuée dans les 30 jours suivant la publication des résultats officiels.</p>
                <p><strong>Remboursement :</strong> Le montant remboursé correspond à l'abonnement mensuel payé (39€) ou au paiement unique (79€) selon la formule souscrite.</p>
                <p className="text-stone-400">Pour toute demande : contact@btsbanquepro.fr</p>
              </div>
            </details>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-stone-950 to-green-950 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Prêt à décrocher ton BTS ?
          </h2>
          <p className="text-stone-300 text-lg mb-8">
            Rejoins les étudiants qui révisent intelligemment et passent leur examen avec confiance.
          </p>
          <a href="#tarifs">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-primary text-white font-display font-bold text-xl px-10 py-5 rounded-2xl shadow-2xl border-b-4 border-green-700 hover:bg-green-500 transition-colors"
            >
              Commencer maintenant →
            </motion.button>
          </a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-stone-950 text-stone-500 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-black text-xs">B</span>
          </div>
          <span className="font-bold text-stone-300">BTS Banque Pro</span>
        </div>
        <p>Plateforme de révision dédiée aux étudiants BTS Banque · Basée sur le programme officiel</p>
        <p className="mt-1 text-stone-600 text-xs">© 2025 BTS Banque Pro · Tous droits réservés</p>
      </footer>
    </div>
  );
}