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
  ArrowRight, RefreshCcw
} from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  {
    to: "/vojes",
    label: "VOJES",
    fullName: "Veille, Organisationnel, Juridique & Sectoriel",
    accentBg: "bg-[#1a1a1a]",
    accentText: "text-white",
    Icon: BarChart2,
    features: [
      "QCM Pareto 20/80", "Mode Jeu voiture", "QCM Infini hardcore",
      "Questions révision", "Réponse libre IA", "Flashcards",
      "10 ans de sujets (2016→2026)", "GPT spécialisé VOJES",
    ],
  },
  {
    to: "/cesbf",
    label: "CESBF",
    fullName: "Conseil & Expertise en Solutions Bancaires & Financières",
    accentBg: "bg-[#D45A1A]",
    accentText: "text-white",
    Icon: Landmark,
    features: [
      "QCM Pareto 20/80", "Mode Jeu voiture", "QCM Infini hardcore",
      "Questions révision", "Réponse libre IA", "Flashcards",
      "Certif AMF incluse 🎁", "10 ans de sujets (2016→2026)",
    ],
  },
  {
    to: "/anglais",
    label: "Anglais",
    fullName: "Business English — Vocabulaire & Expression",
    accentBg: "bg-[#2d5a8e]",
    accentText: "text-white",
    Icon: BookOpen,
    features: [
      "150 flashcards métier", "QCM de traduction",
      "Exercices d'écriture", "Suivi de progression",
      "Mode express", "Lexique par catégorie",
    ],
  },
  {
    to: "/culture-generale",
    label: "Culture Générale",
    fullName: "Actualités, histoire & questions de société",
    accentBg: "bg-[#6b6b6b]",
    accentText: "text-white",
    Icon: Globe,
    features: [
      "Fiches thématiques", "QCM d'entraînement",
      "Flashcards culture", "Contenu bientôt disponible",
    ],
    soon: true,
  },
];

const METHODS = [
  { icon: Target,       label: "QCM Pareto",      desc: "La méthode 20/80 : apprends l'essentiel en priorité." },
  { icon: Gamepad2,     label: "Jeu voiture",      desc: "Révise en conduisant et en choisissant la bonne voie." },
  { icon: InfinityIcon, label: "QCM Infini",       desc: "Mode hardcore : enchaîne les questions sans limite." },
  { icon: Brain,        label: "Flashcards",       desc: "Mémorise avec le système de cartes recto-verso." },
  { icon: PenLine,      label: "Réponse libre IA", desc: "L'IA évalue ta rédaction et te donne un feedback." },
  { icon: Pen,          label: "Mémo Dessin",      desc: "Trace pour mémoriser : schémas et formules." },
  { icon: ListChecks,   label: "Révision mentale", desc: "Questions ouvertes, réfléchis puis révèle la réponse." },
  { icon: Bot,          label: "Assistant GPT",    desc: "Pose tes questions à un GPT spécialisé par matière." },
];

const TESTIMONIALS = [
  { name: "Mathis R.", score: "17/20 à VOJES", text: "Le mode jeu voiture m'a permis de mémoriser sans m'en rendre compte. Les QCM Pareto sont ultra efficaces.", stars: 5 },
  { name: "Léa M.", score: "Mention TB", text: "La certif AMF incluse dans CESBF, c'est un vrai plus. J'ai validé ma certif en 3 semaines grâce à la plateforme.", stars: 5 },
  { name: "Antoine D.", score: "Admis BTS Banque", text: "Les 10 ans de sujets avec l'analyseur IA, ça m'a donné une vision claire de ce qui tombe vraiment à l'examen.", stars: 5 },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#F5F0E8", fontFamily: "'Nunito', sans-serif", color: "#1a1a1a" }}>
      <FloatingPopup subject="ALL" />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a]/10" style={{ background: "#F5F0E8" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white font-black text-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>b</span>
            </div>
            <span className="font-bold text-sm text-[#1a1a1a]">btsbanque.co</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1a1a1a]/60">
            <a href="#matieres" className="hover:text-[#1a1a1a] transition-colors">Matières</a>
            <a href="#methodes" className="hover:text-[#1a1a1a] transition-colors">Méthode</a>
            <a href="#tarifs" className="hover:text-[#1a1a1a] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#1a1a1a] transition-colors">FAQ</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <NavAuth />
            <a href="#tarifs" className="hidden md:flex items-center gap-2 bg-[#1a1a1a] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors">
              Commencer <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="border-b border-[#1a1a1a]/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm">
          <span className="w-2 h-2 rounded-full bg-[#D45A1A] animate-pulse shrink-0" />
          <span className="text-[#1a1a1a]/60 font-medium">2 826 étudiants ont rejoint la promo 2026</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{ fontFamily: "'Georgia', 'Times New Roman', serif", lineHeight: 1.05 }}
              className="text-6xl md:text-8xl font-black text-[#1a1a1a] mb-8">
              Décroche ton{" "}
              <em className="not-italic" style={{ fontStyle: "italic" }}>BTS Banque</em>
              {" "}sans{" "}
              <span style={{ color: "#D45A1A", textDecoration: "underline", textDecorationThickness: "3px" }}>bachoter</span>
              {" "}3 mois.
            </h1>

            <p className="text-[#1a1a1a]/65 text-base leading-relaxed mb-10 max-w-sm">
              La plateforme de révision <strong className="text-[#1a1a1a] font-bold">la plus complète</strong> pour réviser
              CESB, Voies, Anglais et Culture Générale. Fiches, quiz,
              annales corrigées —{" "}
              <strong className="text-[#1a1a1a] font-bold">tout dans un seul outil</strong>, conçu par
              des anciens majors de promo.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a href="#tarifs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-[#1a1a1a] text-white font-bold text-base px-7 py-4 rounded-full hover:bg-[#333] transition-colors"
                >
                  Essayer gratuitement <ArrowRight className="w-4 h-4" />
                </motion.button>
              </a>
              <a href="#methodes" className="text-[#1a1a1a]/60 font-medium text-sm hover:text-[#1a1a1a] transition-colors underline underline-offset-4">
                Voir la méthode
              </a>
            </div>
          </motion.div>

          {/* Right — social proof */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col justify-end items-start md:items-end pt-8 md:pt-32 gap-4"
          >
            {/* Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["LM", "TK", "NB", "AR"].map((initials, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#F5F0E8] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: ["#6366f1", "#059669", "#d97706", "#dc2626"][i] }}>
                    {initials}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#F5F0E8] bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D45A1A] text-[#D45A1A]" />
                  ))}
                  <span className="text-sm font-bold text-[#1a1a1a] ml-1">4.9/5</span>
                </div>
                <div className="text-xs text-[#1a1a1a]/50 font-medium"><strong className="text-[#1a1a1a]">2 826</strong> étudiants déjà inscrits</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── MATIÈRES ── */}
      <section id="matieres" className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Programme complet</p>
          <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight">
            Tout le programme<br />BTS Banque.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {SUBJECTS.map((subj, i) => (
            <motion.div
              key={subj.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={subj.to}>
                <div className="group border border-[#1a1a1a]/12 rounded-2xl overflow-hidden hover:border-[#1a1a1a]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ background: "#EEEAE0" }}>
                  {/* Header */}
                  <div className={`${subj.accentBg} px-6 py-5 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <subj.Icon className="w-5 h-5 text-white/70" />
                      <div>
                        <div className="font-black text-white text-lg leading-none" style={{ fontFamily: "'Georgia', serif" }}>{subj.label}</div>
                        <div className="text-white/55 text-xs mt-0.5">{subj.fullName}</div>
                      </div>
                    </div>
                    {subj.soon ? (
                      <span className="text-xs font-bold text-white/50 border border-white/20 px-2 py-0.5 rounded-full">Bientôt</span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                  {/* Features */}
                  <div className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {subj.features.map((feat, j) => (
                        <span key={j} className="text-xs font-semibold text-[#1a1a1a]/60 bg-[#1a1a1a]/6 px-2.5 py-1 rounded-full">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── MÉTHODES ── */}
      <section id="methodes" className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-3">8 méthodes</p>
          <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight">
            Chaque cerveau<br />apprend <em style={{ color: "#D45A1A" }}>différemment.</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {METHODS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="border border-[#1a1a1a]/10 rounded-2xl p-5 hover:border-[#1a1a1a]/25 hover:-translate-y-0.5 transition-all"
              style={{ background: "#EEEAE0" }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center mb-4">
                <m.icon className="w-4 h-4 text-white" />
              </div>
              <div className="font-bold text-[#1a1a1a] text-sm mb-1" style={{ fontFamily: "'Georgia', serif" }}>{m.label}</div>
              <div className="text-[#1a1a1a]/50 text-xs leading-snug">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── AMF BONUS ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "#1a1a1a" }}
        >
          <div className="p-10 md:p-14 flex flex-col md:flex-row items-start gap-10">
            <div className="flex-1">
              <span className="inline-block text-xs font-bold text-[#D45A1A] bg-[#D45A1A]/15 px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                🎁 Bonus exclusif CESBF
              </span>
              <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl md:text-5xl font-black text-white leading-tight mb-5">
                Certif AMF<br />incluse dans CESBF.
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-8 max-w-sm">
                12 thèmes officiels, des centaines de questions et un simulateur d'examen
                te préparent à valider ta certification AMF dès ton BTS.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["12 thèmes officiels", "Simulateur d'examen", "L'Inspecteur AMF", "Questions réelles"].map(tag => (
                  <span key={tag} className="text-xs font-semibold text-white/60 border border-white/15 px-3 py-1 rounded-full">
                    ✓ {tag}
                  </span>
                ))}
              </div>
              <Link to="/cesbf/amf">
                <button className="flex items-center gap-2 bg-[#D45A1A] text-white font-bold px-6 py-3 rounded-full hover:bg-[#c04f15] transition-colors text-sm">
                  Voir le module AMF <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="text-center md:self-center shrink-0">
              <div className="text-7xl">🏆</div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── TÉMOIGNAGES ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Témoignages</p>
          <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight">
            Ils ont décroché<br />leur BTS. <span style={{ color: "#D45A1A" }}>🎓</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-[#1a1a1a]/10 rounded-2xl p-6"
              style={{ background: "#EEEAE0" }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-[#D45A1A] text-[#D45A1A]" />
                ))}
              </div>
              <p className="text-[#1a1a1a]/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div>
                <div className="font-bold text-[#1a1a1a] text-sm">{t.name}</div>
                <div className="text-[#D45A1A] text-xs font-semibold mt-0.5">{t.score}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── TARIFS ── */}
      <section id="tarifs" className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-3">Tarifs</p>
          <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-4xl md:text-6xl font-black text-[#1a1a1a] leading-tight">
            Simple,<br /><em style={{ color: "#D45A1A" }}>transparent.</em>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
          {/* Mensuel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[#1a1a1a]/12 rounded-2xl p-8 flex flex-col"
            style={{ background: "#EEEAE0" }}
          >
            <div className="font-bold text-[#1a1a1a] text-base mb-1" style={{ fontFamily: "'Georgia', serif" }}>Accès mensuel</div>
            <div className="text-[#1a1a1a]/45 text-sm mb-6">Résilie à tout moment</div>
            <div className="mb-6">
              <span className="font-black text-[#1a1a1a]" style={{ fontFamily: "'Georgia', serif", fontSize: "3.5rem", lineHeight: 1 }}>39€</span>
              <span className="text-[#1a1a1a]/45 font-medium text-sm">/mois</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {["Accès à toutes les matières","8 méthodes d'apprentissage","Certif AMF incluse","10 ans de sujets","GPT spécialisé par matière","Garantie admis ou remboursé"].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[#1a1a1a]/70 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#1a1a1a]/40 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/vojes">
              <button className="w-full bg-[#1a1a1a] text-white font-bold py-3.5 rounded-full hover:bg-[#333] transition-colors text-sm">
                Commencer maintenant
              </button>
            </Link>
          </motion.div>

          {/* À vie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative border-2 border-[#D45A1A] rounded-2xl p-8 flex flex-col"
            style={{ background: "#1a1a1a" }}
          >
            <span className="absolute -top-3.5 left-6 text-xs font-bold bg-[#D45A1A] text-white px-3 py-1 rounded-full">
              ⚡ Meilleure offre
            </span>
            <div className="font-bold text-white text-base mb-1" style={{ fontFamily: "'Georgia', serif" }}>Accès à vie</div>
            <div className="text-white/40 text-sm mb-6">Paiement unique — accès permanent</div>
            <div className="mb-2">
              <span className="font-black text-white" style={{ fontFamily: "'Georgia', serif", fontSize: "3.5rem", lineHeight: 1 }}>79€</span>
              <span className="text-white/40 font-medium text-sm"> une fois</span>
            </div>
            <div className="text-[#D45A1A] text-xs font-bold mb-6">Économise par rapport au mensuel</div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {["Tout de l'offre mensuelle","Accès à vie, pas d'abonnement","Contenu mis à jour à vie","Accès aux futures matières","Support prioritaire","Garantie admis ou remboursé"].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-white/60 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#D45A1A] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/vojes">
              <button className="w-full bg-[#D45A1A] text-white font-bold py-3.5 rounded-full hover:bg-[#c04f15] transition-colors text-sm">
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
          className="mt-8 border border-[#1a1a1a]/12 rounded-2xl p-6 max-w-2xl"
          style={{ background: "#EEEAE0" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🛡️</span>
            <div>
              <div className="font-bold text-[#1a1a1a] text-sm mb-1" style={{ fontFamily: "'Georgia', serif" }}>Garantie Admis ou Remboursé</div>
              <p className="text-[#1a1a1a]/55 text-xs leading-relaxed mb-3">
                Si tu utilises la plateforme sérieusement et que tu n'obtiens pas ton BTS Banque, on te rembourse intégralement.
              </p>
              <details>
                <summary className="text-xs font-bold text-[#1a1a1a]/40 cursor-pointer hover:text-[#1a1a1a]/70 transition-colors select-none">
                  📋 Voir les conditions →
                </summary>
                <div className="mt-3 text-xs text-[#1a1a1a]/55 leading-relaxed space-y-2 border-t border-[#1a1a1a]/10 pt-3">
                  <p><strong className="text-[#1a1a1a]">Utilisation sérieuse :</strong> Minimum 1 heure cumulée de session enregistrée.</p>
                  <p><strong className="text-[#1a1a1a]">Preuve d'échec :</strong> Relevé de notes ou attestation officielle de résultats.</p>
                  <p><strong className="text-[#1a1a1a]">Délai :</strong> 30 jours après publication des résultats officiels.</p>
                  <p className="text-[#1a1a1a]/35">contact@btsbanquepro.fr</p>
                </div>
              </details>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-[#1a1a1a]/10" />

      {/* ── CTA FINAL ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-5xl md:text-7xl font-black text-[#1a1a1a] leading-tight mb-6">
            Prêt à décrocher<br />ton <span style={{ color: "#D45A1A" }}>BTS ?</span>
          </h2>
          <p className="text-[#1a1a1a]/55 text-base mb-10 max-w-md mx-auto">
            Rejoins les étudiants qui révisent intelligemment et passent leur examen avec confiance.
          </p>
          <a href="#tarifs">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white font-bold text-lg px-10 py-5 rounded-full hover:bg-[#333] transition-colors"
            >
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </motion.button>
          </a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a1a1a]/10 px-6 py-8" style={{ background: "#EEEAE0" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#1a1a1a]/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-white font-black text-xs">b</span>
            </div>
            <span className="font-bold text-[#1a1a1a]/70 text-xs">btsbanque.co</span>
          </div>
          <p className="text-xs">Plateforme de révision dédiée aux étudiants BTS Banque · Programme officiel</p>
          <p className="text-xs">© 2025 BTS Banque Pro · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}