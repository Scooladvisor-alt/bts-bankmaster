import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, LayoutDashboard, TrendingUp, Grid3X3, HelpCircle, FileText, Shield, Lightbulb, Clock } from "lucide-react";

const YEARS = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

const THEMES = [
  { id: "note", name: "Note structurée", years: [16,17,18,19,20,21,22,23,24,25], prob: 100, level: "critical", trend: "Stable", derniere: 25, note: "Présente chaque année sans exception. Toujours la dernière question du sujet. Environ 8 points sur 20.", examples: [{yr:"2017",q:"Préparez une note structurée présentant les enjeux de la RSE puis sa mise en œuvre par les établissements de crédit."},{yr:"2022",q:"Rédigez une note structurée présentant les mesures de politique budgétaire de l'État puis les dispositifs des banques pour aider leur clientèle face à la crise Covid."},{yr:"2025",q:"Rédigez une note dans laquelle vous analyserez pourquoi les banques placent la transition écologique au cœur de leur RSE."}] },
  { id: "juridique", name: "Question juridique (PRSJ)", years: [16,17,18,19,20,21,22,23,24,25], prob: 100, level: "critical", trend: "Stable", derniere: 25, note: "Toujours formulée 'Présenter le problème juridique, les règles de droit applicables et la solution'. Une annexe législative est systématiquement fournie.", examples: [{yr:"2016",q:"Benjamin R. a été débité suite au vol de sa carte. La banque refuse de rembourser. Présentez le problème juridique et la solution."},{yr:"2024",q:"Un étudiant effectue des mouvements bancaires atypiques. Présentez le problème juridique, les règles et la solution."},{yr:"2025",q:"Une erreur d'authentification a conduit à un virement sur les comptes d'un homonyme. Présentez le problème juridique et la solution."}] },
  { id: "bce", name: "BCE & politique des taux", years: [16,17,18,19,20,21,22,23,24,25], prob: 95, level: "critical", trend: "Stable", derniere: 25, note: "Absolument systématique. Taux directeurs, objectif d'inflation 2%, QE, déflation, politique accommodante.", examples: [{yr:"2016",q:"Expliquez en quoi la politique monétaire de la BCE peut être jugée favorable au développement économique."},{yr:"2023",q:"Expliquez en quoi la décision de la BCE d'augmenter ses taux directeurs a des répercussions sur les différents agents économiques."},{yr:"2025",q:"Indiquez trois éléments de l'environnement économique qui influencent les taux d'intérêt. Montrez comment la baisse des taux stimule la croissance."}] },
  { id: "epargne", name: "Épargne des ménages / Livret A", years: [16,17,18,19,20,21,22,23,24,25], prob: 90, level: "critical", trend: "Stable", derniere: 25, note: "Taux du Livret A, déterminants de l'épargne, arbitrage consommation/épargne, produits réglementés.", examples: [{yr:"2017",q:"Présentez les déterminants de l'épargne des ménages. Précisez en quoi la baisse du taux du Livret A permet de lutter contre la déflation."},{yr:"2023",q:"Citez les caractéristiques qui font du Livret A un produit d'épargne réglementée."},{yr:"2024",q:"Identifiez quatre raisons qui peuvent inciter les ménages français à épargner."}] },
  { id: "inclusion", name: "Inclusion bancaire / Clientèle fragile", years: [16,17,18,20,22,24], prob: 75, level: "high", trend: "Croissante", derniere: 24, note: "Droit au compte, Offre Client Fragile (OCF), plafonnement des frais, surendettement.", examples: [{yr:"2017",q:"Qualifiez le type de clientèle du client en situation de découvert depuis 3 mois."},{yr:"2022",q:"Présentez l'autre dispositif imposé aux banques pour l'inclusion bancaire."},{yr:"2024",q:"Dans une note structurée, présentez les dispositifs d'inclusion bancaire en France."}] },
  { id: "rse", name: "RSE & Finance durable", years: [17,23,25], prob: 72, level: "high", trend: "Croissante", derniere: 25, note: "Très croissant : 2017 → 2023 → 2025. Transition écologique, ISR, labels Greenfin/ISR, PEAC.", examples: [{yr:"2017",q:"Présentez les enjeux de la RSE puis sa mise en œuvre par les établissements de crédit."},{yr:"2023",q:"Présentez les composantes de la RSE. Identifiez les enjeux de la RSE pour la banque."},{yr:"2025",q:"Montrez comment l'État oriente l'épargne des ménages vers la finance verte."}] },
  { id: "lab", name: "Lutte anti-blanchiment (LAB-FT)", years: [18,21,24], prob: 70, level: "high", trend: "Cyclique (3 ans)", derniere: 24, note: "Revient tous les ~3 ans. Tracfin, déclaration de soupçon, LCBFT, sanctions ACPR.", examples: [{yr:"2018",q:"Présentez les obligations du conseiller confronté à une cliente au RSA ayant des mouvements atypiques."},{yr:"2021",q:"Expliquez les obligations d'information, de conseil et de mise en garde en matière de placement."},{yr:"2024",q:"À l'aide de l'article 324-1 du code pénal, présentez le problème juridique."}] },
  { id: "famille", name: "Droit de la famille / Régimes matrimoniaux", years: [18,19,20,21,23], prob: 65, level: "high", trend: "Stable", derniere: 23, note: "Communauté légale, séparation de biens, solidarité des époux (art. 220 CC), curatelle, majeurs protégés.", examples: [{yr:"2020",q:"Mme Milla (séparation de biens) ne peut plus payer son crédit. La banque peut-elle s'adresser au conjoint ?"},{yr:"2021",q:"M. Durand (communauté légale) emprunte seul pour une sculpture de bureau. Son épouse est-elle solidaire ?"},{yr:"2023",q:"Mme DALI (curatelle) veut racheter son assurance vie. Étudiez la faisabilité."}] },
  { id: "risques", name: "Risques bancaires & régulation (Bâle)", years: [16,18,22], prob: 60, level: "medium", trend: "Stable", derniere: 22, note: "Risque de crédit, liquidité, opérationnel, systémique. Bâle III, ACPR, fonds propres.", examples: [{yr:"2016",q:"Précisez la nature des risques rencontrés par la banque lors de l'octroi d'un crédit."},{yr:"2018",q:"Présentez les piliers de l'Union bancaire. Identifiez l'ACPR et présentez ses missions."},{yr:"2022",q:"Présentez les risques auxquels les établissements de crédit sont confrontés."}] },
  { id: "fintech", name: "Fintechs / Digitalisation / IA", years: [16,18,19,22], prob: 50, level: "medium", trend: "Stable", derniere: 22, note: "IA bancaire (2022), Fintechs (2019), numérique (2016 et 2018). Absent depuis 3 ans. Fort potentiel 2026.", examples: [{yr:"2016",q:"Précisez les notions de banque en ligne et de banque multicanale."},{yr:"2019",q:"Démontrez en quoi les Fintechs constituent une menace et que la coopétition est une réponse incontournable."},{yr:"2022",q:"Montrez comment l'intelligence artificielle peut permettre de répondre aux attentes des clients."}] },
  { id: "types", name: "Types d'établissements de crédit", years: [18,19,21,24], prob: 55, level: "medium", trend: "Stable", derniere: 24, note: "Banques mutualistes vs commerciales, ACPR, missions, agrément, différences structurelles.", examples: [{yr:"2019",q:"Expliquez en quoi les banques mutualistes sont des banques universelles."},{yr:"2021",q:"Différenciez une banque mutualiste d'une banque commerciale (4 éléments)."},{yr:"2024",q:"Précisez les caractéristiques d'une banque commerciale."}] },
  { id: "financement", name: "Financement de l'économie", years: [16,17,18,25], prob: 55, level: "medium", trend: "Croissante", derniere: 25, note: "Financement direct/indirect, marchés financiers, crowdfunding, finance verte.", examples: [{yr:"2016",q:"Étudiez succinctement la place du crédit dans le financement de l'économie."},{yr:"2017",q:"Présentez les différents modes de financement de l'économie."},{yr:"2025",q:"Présentez les différentes formes de financement des entreprises. Montrez comment l'État oriente l'épargne vers la finance verte."}] },
];

const ALL_QUESTIONS = [
  {year:2016,text:"Expliquer les obligations générales du banquier lors de la mise en place d'un crédit",category:"Droit/Conformité",important:true},
  {year:2016,text:"Préciser la nature des risques rencontrés par la banque lors de l'octroi d'un crédit",category:"Risques",important:false},
  {year:2016,text:"Citer les instruments de la politique monétaire utilisés par la BCE",category:"BCE/Taux",important:true},
  {year:2016,text:"Préciser les notions de banque en ligne et de banque multicanale",category:"Digital/Innovation",important:false},
  {year:2017,text:"Présenter les différents modes de financement de l'économie",category:"Financement",important:true},
  {year:2017,text:"Qualifier le type de clientèle fragile et justifier la réponse",category:"Inclusion bancaire",important:true},
  {year:2017,text:"Présenter les déterminants de l'épargne des ménages",category:"Épargne",important:true},
  {year:2017,text:"Préciser en quoi la baisse du taux du Livret A permet de lutter contre la déflation",category:"BCE/Taux",important:true},
  {year:2018,text:"Présenter les piliers de l'Union bancaire",category:"Réglementation",important:true},
  {year:2018,text:"Identifier l'ACPR et présenter ses missions",category:"Réglementation",important:true},
  {year:2018,text:"Présenter les obligations du conseiller face au blanchiment",category:"Droit/Conformité",important:true},
  {year:2019,text:"Expliquer en quoi les banques mutualistes sont des banques universelles",category:"Types de banques",important:true},
  {year:2019,text:"Repérer les éléments conjoncturels pouvant justifier une remontée des taux BCE",category:"BCE/Taux",important:true},
  {year:2019,text:"Présenter les principaux déterminants de l'inflation",category:"Économie macro",important:true},
  {year:2019,text:"Rappeler les conditions générales de validité d'un contrat (art. 1128 CC)",category:"Droit civil",important:true},
  {year:2020,text:"Préciser la notion d'expérience client",category:"Commercial",important:false},
  {year:2020,text:"Rappeler les effets juridiques d'un contrat à l'égard des parties",category:"Droit civil",important:true},
  {year:2020,text:"Détailler les principales composantes du PNB",category:"PNB/Rentabilité",important:true},
  {year:2020,text:"Présenter les caractéristiques du régime légal et de la séparation de biens",category:"Droit famille",important:true},
  {year:2021,text:"Différencier une banque mutualiste d'une banque commerciale (4 éléments)",category:"Types de banques",important:true},
  {year:2021,text:"Indiquer les effets attendus de la diversification pour une banque",category:"Stratégie",important:true},
  {year:2021,text:"Expliquer les obligations d'information et de conseil du banquier (MIF)",category:"Droit/Conformité",important:true},
  {year:2022,text:"Indiquer comment se forme le produit net bancaire (PNB)",category:"PNB/Rentabilité",important:true},
  {year:2022,text:"Présenter les risques auxquels les établissements de crédit sont confrontés",category:"Risques",important:true},
  {year:2022,text:"Indiquer 5 critères de satisfaction des clients",category:"Commercial",important:true},
  {year:2022,text:"Montrer comment l'IA permet de répondre aux attentes clients",category:"Digital/Innovation",important:false},
  {year:2022,text:"Présenter l'autre dispositif imposé aux banques pour l'inclusion bancaire",category:"Inclusion bancaire",important:true},
  {year:2023,text:"Citer les caractéristiques du Livret A comme produit d'épargne réglementée",category:"Épargne",important:true},
  {year:2023,text:"Montrer l'intérêt de l'épargne réglementée pour chaque agent économique",category:"Épargne",important:true},
  {year:2023,text:"Expliquer les raisons de l'augmentation du taux du Livret A",category:"BCE/Taux",important:true},
  {year:2023,text:"Présenter les composantes de la RSE",category:"RSE/Durabilité",important:true},
  {year:2024,text:"Préciser les caractéristiques d'une banque commerciale",category:"Types de banques",important:true},
  {year:2024,text:"Présenter les autorités d'agrément et de supervision des banques",category:"Réglementation",important:true},
  {year:2024,text:"Identifier 4 raisons qui incitent les ménages à épargner",category:"Épargne",important:true},
  {year:2024,text:"Expliquer les deux comportements des ménages face à l'inflation",category:"Économie macro",important:true},
  {year:2025,text:"Présenter les différentes formes de financement des entreprises",category:"Financement",important:true},
  {year:2025,text:"Montrer comment l'État oriente l'épargne vers la finance verte",category:"RSE/Durabilité",important:true},
  {year:2025,text:"Rappeler les obligations professionnelles du banquier lors de la souscription",category:"Droit/Conformité",important:true},
  {year:2025,text:"Indiquer les éléments influençant les taux d'intérêt des crédits",category:"BCE/Taux",important:true},
  {year:2025,text:"Présenter les intérêts de la diversification pour une banque",category:"Stratégie",important:true},
];

const JURIDIQUE = [
  {year:"2016",situation:"Fraude à la carte bancaire — vol + utilisation du code confidentiel",droit:"Art. L.132-3 Code monétaire",p:"Benjamin R. est débité de 5 000€. La banque lui demande de prouver qu'il n'a pas été négligent.",r:"Art. L.132-3 : la charge de la preuve de la négligence du titulaire revient à l'émetteur.",s:"La banque doit prouver la négligence du client. Benjamin doit être remboursé, sauf preuve de faute lourde établie par la banque."},
  {year:"2017",situation:"Secret bancaire — mari réclame des infos sur le compte de sa femme hospitalisée",droit:"Article 226-13 Code pénal — secret professionnel",p:"M. Denis demande le solde du Livret de Mme Denis hospitalisée et veut effectuer un retrait en son nom.",r:"Art. 226-13 CP : la révélation d'une information secrète est punie d'1 an d'emprisonnement et 15 000€.",s:"Refus total de communication et de retrait. M. Denis doit fournir une procuration écrite signée par son épouse."},
  {year:"2020",situation:"Solidarité conjugale — séparation de biens — crédit souscrit seule pour travaux de chauffage",droit:"Régime primaire — Art. 220 Code civil",p:"Mme Milla (séparation de biens) a souscrit seule un prêt de 3 500€ pour réparer les appareils de chauffage du logement familial.",r:"Art. 220 CC : chaque époux peut passer seul des contrats pour l'entretien du ménage, la dette obligeant l'autre solidairement.",s:"Solidarité applicable : réparation du chauffage = entretien du ménage. La banque peut se retourner contre le mari."},
  {year:"2023",situation:"Majeur sous curatelle souhaitant racheter intégralement son assurance vie (45 000€)",droit:"Régime de la curatelle — actes de disposition — Code civil",p:"Mme DALI (70 ans, sous curatelle) veut racheter l'intégralité de son contrat d'assurance vie de 45 000€.",r:"La curatelle implique l'assistance obligatoire du curateur pour les actes de disposition importants.",s:"Le rachat est impossible sans l'accord écrit du curateur. Le conseiller doit refuser l'opération."},
  {year:"2024",situation:"Mouvements bancaires atypiques d'un étudiant — suspicion de blanchiment de capitaux",droit:"Article 324-1 Code pénal — Obligations LCBFT — Tracfin",p:"Arthur X (étudiant) effectue des dépôts récurrents suivis de retraits espèces et virements vers d'autres comptes.",r:"Art. 324-1 CP : blanchiment puni de 5 ans et 375 000€. Obligation de déclaration à Tracfin en cas de soupçon.",s:"Déclaration de soupçon à Tracfin obligatoire et immédiate. Ne jamais informer Arthur X de la déclaration."},
  {year:"2025",situation:"Erreur d'authentification — virement réalisé sur les comptes d'un homonyme",droit:"Article 1240 Code civil — Responsabilité civile délictuelle",p:"Pierre Durand demande un virement de son Livret A. La banque l'exécute sur les comptes de son homonyme par erreur.",r:"Art. 1240 CC : tout fait causant un dommage à autrui oblige son auteur à le réparer. Faute + préjudice + lien causal.",s:"Responsabilité de la banque engagée. Elle doit annuler l'opération, rembourser les commissions et effectuer le virement demandé."},
];

const PREDICTIONS = [
  {title:"Question juridique — Quasi-certaine",prob:95,level:"critical",reasoning:"Présente 10/10 sessions sans exception. En 2026 : probable retour sur la fraude numérique (phishing, jamais traité), la tutelle, ou un cas de procuration bancaire.",question:"Situation probable : client victime d'usurpation d'identité en ligne, ou opération litigieuse suite à une faille de sécurité.",tags:["100% certaine","Juridique","PRSJ"]},
  {title:"Note structurée — Quasi-certaine",prob:95,level:"critical",reasoning:"Présente 10/10 sessions. Thèmes jamais encore traités en note : IA et transformation bancaire, open banking/DSP3, cybersécurité bancaire.",question:"Thème probable : 'L'IA dans la banque : opportunités pour la relation client et risques pour la profession'",tags:["100% certaine","Note structurée","2026"]},
  {title:"BCE / Politique monétaire",prob:90,level:"critical",reasoning:"Présente dans les 10 sujets. En 2026, le contexte sera la stabilisation autour de 2% d'inflation. Questions probables : mécanismes de transmission monétaire.",question:"Expliquez les effets de la normalisation des taux directeurs sur l'activité bancaire et le financement de l'économie.",tags:["Quasi-certaine","BCE","Politique monétaire"]},
  {title:"Épargne — Comportements et produits",prob:85,level:"high",reasoning:"Présente chaque année. En 2026 : probable retour sur l'arbitrage épargne/consommation, la baisse du Livret A, ou l'assurance-vie.",question:"Présentez les déterminants de l'épargne des ménages. Analysez les effets d'une baisse du Livret A sur les comportements d'épargne.",tags:["Très probable","Épargne","Ménages"]},
  {title:"IA & Transformation bancaire — Thème montant",prob:65,level:"medium",reasoning:"L'IA a été abordée en 2022. En 2026, avec l'explosion des LLM et des robo-advisors, un sujet plus approfondi est attendu : IA et relation client, RGPD, enjeux éthiques.",question:"Montrez comment l'IA transforme la relation client bancaire ET analysez les risques qu'elle génère pour les banques.",tags:["Probable","Innovation","Jamais traité en note"]},
];

const TIMELINE = [
  {year:"2025",themes:"Finance verte (PEAC, MIF2) • BCE baisse taux • Diversification • Erreur authentification • RSE écologique (note)",note:"Contexte : transition écologique, normalisation taux"},
  {year:"2024",themes:"Banque commerciale (ACPR) • Revenus ménages / redistribution • Blanchiment • Inclusion bancaire (note)",note:"Contexte : inflation en baisse, ménages fragilisés"},
  {year:"2023",themes:"Livret A et épargne réglementée • RSE / ISR • Curatelle (majeur protégé) • Inflation + hausse taux (note)",note:"Contexte : pic inflation 5,2%, forte hausse taux directeurs"},
  {year:"2022",themes:"PNB et risques • IA bancaire • OCF clientèle fragile • Plan de relance + banques Covid (note)",note:"Contexte : début inflation, guerre Ukraine, crise énergétique"},
  {year:"2021",themes:"Banque mutualiste vs commerciale • ACPR • FOREX • Solidarité conjugale • Qualité (note)",note:"Contexte : relance post-COVID, marchés agités"},
  {year:"2020",themes:"Expérience client / omnicanal • PNB (taux bas) • Solidarité conjugale (séparation biens) • BCE taux négatifs (note)",note:"Contexte : COVID, taux au plancher, transformation digitale"},
  {year:"2019",themes:"Banques mutualistes • Inflation et remontée taux BCE • Clause domiciliation • Fintechs (note)",note:"Contexte : menace Fintechs, anticipation hausse taux"},
  {year:"2018",themes:"Union bancaire (ACPR) • Succession ab intestat • Blanchiment • Financement PME (note)",note:"Contexte : nouvelles exigences prudentielles post-crise"},
  {year:"2017",themes:"Crowdfunding vs banque • Clientèle fragile • Livret A et déflation • RSE (note structurée)",note:"Contexte : finance participative en plein essor"},
  {year:"2016",themes:"BCE (taux négatifs, instruments) • Risques & Bâle 3 • Fraude carte bancaire • Numérique et omnicanal",note:"Contexte : taux zéro, début révolution numérique"},
];

const LEVEL_COLORS = { critical: "#dc2626", high: "#d97706", medium: "#4a6cf7" };

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "probabilites", label: "Probabilités 2026", icon: TrendingUp },
  { id: "matrix", label: "Matrice années", icon: Grid3X3 },
  { id: "questions", label: "Base questions", icon: HelpCircle },
  { id: "juridique", label: "Question juridique", icon: Shield },
  { id: "prediction", label: "Prédiction IA", icon: Lightbulb },
  { id: "timeline", label: "Chronologie", icon: Clock },
];

export default function VojesAnalyseur() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedCases, setExpandedCases] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleCard = (id) => setExpandedCards(p => ({ ...p, [id]: !p[id] }));
  const toggleCase = (i) => setExpandedCases(p => ({ ...p, [i]: !p[i] }));

  const categories = ["all", ...new Set(ALL_QUESTIONS.map(q => q.category))].sort();
  const filteredQuestions = categoryFilter === "all" ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.category === categoryFilter);

  const sortedThemes = [...THEMES].sort((a, b) => b.prob - a.prob);

  const levelBadge = (l) => ({
    critical: "bg-red-100 text-red-700",
    high: "bg-amber-100 text-amber-700",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-stone-100 text-stone-500",
  }[l] || "bg-stone-100 text-stone-500");

  const levelBorder = (l) => ({
    critical: "border-l-red-500",
    high: "border-l-amber-500",
    medium: "border-l-blue-500",
  }[l] || "border-l-stone-300");

  const tabIcon = (Tab) => <Tab className="w-4 h-4 shrink-0" />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1e2a4a] min-h-screen fixed top-0 left-0 bottom-0 z-30 overflow-y-auto">
        <div className="px-5 py-6 border-b border-white/10 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📊</span>
          </div>
          <div className="text-white font-bold text-sm">BTS BANQUE — VOJES</div>
          <div className="text-white/40 text-[10px] tracking-widest mt-1">ANALYSEUR DE SUJETS</div>
        </div>
        <nav className="flex-1 py-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-all border-l-3 ${
                  activeTab === tab.id
                    ? "text-white bg-blue-600/20 border-l-blue-500"
                    : "text-white/50 hover:text-white hover:bg-white/5 border-l-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
                {tab.id === "probabilites" && <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 rounded-full">TOP</span>}
                {tab.id === "prediction" && <span className="ml-auto text-[9px] bg-green-500 text-white px-1.5 rounded-full">2026</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link to="/vojes" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors">
            <ChevronLeft className="w-3 h-3" /> Retour VOJES
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e2a4a] px-4 py-3 flex items-center justify-between">
        <Link to="/vojes" className="text-white/60 hover:text-white"><ChevronLeft className="w-5 h-5" /></Link>
        <div className="text-white font-bold text-sm">Analyseur VOJES</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-[#1e2a4a] overflow-y-auto">
            <div className="px-5 py-6 border-b border-white/10"><div className="text-white font-bold text-sm">BTS BANQUE — VOJES</div></div>
            <nav className="py-4">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs font-medium ${activeTab === tab.id ? "text-white bg-blue-600/20" : "text-white/50"}`}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-14 md:top-0 z-20">
          <div className="text-sm font-bold text-[#1e2a4a]">
            {TABS.find(t => t.id === activeTab)?.label}
            <span className="text-xs font-normal text-slate-400 ml-3 border-l border-slate-200 pl-3">Sessions 2016–2025 · 10 sujets analysés</span>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Sujets <strong className="text-blue-600">10</strong></span>
            <span>Thèmes <strong className="text-blue-600">{THEMES.length}</strong></span>
            <span>Questions <strong className="text-blue-600">{ALL_QUESTIONS.length}</strong></span>
          </div>
        </div>

        <div className="p-5 md:p-8 max-w-5xl mx-auto">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1e2a4a]">Analysateur des sujets du BTS VOJES</h1>
                <p className="text-sm text-slate-400 mt-1">Analyse de 10 sujets officiels (2016–2025) · Probabilités calculées pour la session 2026</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  {label:"Sujets analysés", value:"10", sub:"Sessions 2016 → 2025", color:"text-blue-600", bg:"bg-blue-50"},
                  {label:"Thèmes à 100%", value:"3", sub:"Note · Juridique · BCE", color:"text-red-600", bg:"bg-red-50"},
                  {label:"Questions répertoriées", value:ALL_QUESTIONS.length, sub:"Depuis 2016", color:"text-amber-600", bg:"bg-amber-50"},
                  {label:"Thèmes identifiés", value:THEMES.length, sub:"Classés par probabilité", color:"text-green-600", bg:"bg-green-50"},
                ].map((m, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                    <div className={`text-xs font-medium ${m.color} mb-1`}>{m.label}</div>
                    <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  {label:"Note structurée", pct:100, color:"#dc2626"},
                  {label:"Question juridique", pct:100, color:"#dc2626"},
                  {label:"BCE / Taux directeurs", pct:95, color:"#dc2626"},
                  {label:"Épargne / Livret A", pct:90, color:"#d97706"},
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
                    <div className="text-sm font-semibold text-slate-700 flex-1">{c.label}</div>
                    <div className="text-xl font-bold" style={{color: c.color}}>{c.pct}%</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-3">Top 5 thèmes à maîtriser absolument</h3>
                {sortedThemes.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="flex-1 text-sm font-medium text-slate-700">{t.name}</div>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${t.prob}%`, background: LEVEL_COLORS[t.level]}} />
                    </div>
                    <div className="text-sm font-bold w-10 text-right" style={{color: LEVEL_COLORS[t.level]}}>{t.prob}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROBABILITES */}
          {activeTab === "probabilites" && (
            <div>
              <p className="text-sm text-slate-400 mb-5">Classement des thèmes · Cliquer sur une carte pour voir les exemples de questions réelles</p>
              <div className="grid md:grid-cols-2 gap-4">
                {sortedThemes.map(t => (
                  <div key={t.id} onClick={() => toggleCard(t.id)} className={`bg-white rounded-xl border ${expandedCards[t.id] ? 'border-blue-400' : 'border-slate-100'} shadow-sm cursor-pointer hover:shadow-md transition-all`}>
                    <div className={`p-4 border-l-4 ${levelBorder(t.level)} rounded-t-xl`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="font-semibold text-sm text-slate-800">{t.name}</div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${levelBadge(t.level)}`}>{t.prob}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full" style={{width:`${t.prob}%`, background: LEVEL_COLORS[t.level]}} />
                      </div>
                      <div className="flex gap-2 flex-wrap text-[10px] text-slate-400">
                        <span className="bg-slate-50 px-2 py-0.5 rounded">{t.years.length}/10 ans</span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded">Dernière: 20{t.derniere}</span>
                        <span className="bg-slate-50 px-2 py-0.5 rounded">{t.trend}</span>
                      </div>
                    </div>
                    {expandedCards[t.id] && (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{t.note}</p>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exemples de questions réelles</div>
                        {t.examples.map((e, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0 mt-0.5">{e.yr}</span>
                            <span className="text-xs text-slate-600 leading-relaxed">{e.q}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATRIX */}
          {activeTab === "matrix" && (
            <div>
              <p className="text-xs text-slate-400 mb-4">✓ = présent · Prédiction 2026 en dernière colonne</p>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[700px] text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-slate-400 font-semibold w-44">Thème</th>
                      {YEARS.map(y => <th key={y} className="px-1 py-3 text-slate-400 font-semibold text-center">'{y}</th>)}
                      <th className="px-2 py-3 text-blue-500 font-semibold text-center">'26?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedThemes.map(t => (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700">{t.name}</td>
                        {YEARS.map(y => (
                          <td key={y} className="px-1 py-2 text-center">
                            {t.years.includes(y) ? <span className="text-blue-600 font-bold">✓</span> : <span className="text-slate-200">·</span>}
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center text-sm">
                          {t.prob >= 90 ? "🔴" : t.prob >= 70 ? "🟠" : t.prob >= 50 ? "🟡" : "⚪"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-slate-400">
                <span>🔴 Quasi-certain</span><span>🟠 Très probable</span><span>🟡 Probable</span><span>⚪ Incertain</span>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {activeTab === "questions" && (
            <div>
              <p className="text-sm text-slate-400 mb-4">{ALL_QUESTIONS.length} questions répertoriées — ★ = question fréquente à maîtriser</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategoryFilter(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${categoryFilter === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"}`}>
                    {c === "all" ? `Toutes (${ALL_QUESTIONS.length})` : c}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[60px_1fr_140px_40px] px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div>Année</div><div>Question</div><div>Catégorie</div><div className="text-center">Fréq.</div>
                </div>
                {filteredQuestions.map((q, i) => (
                  <div key={i} className="grid grid-cols-[60px_1fr_140px_40px] px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 items-start last:border-0">
                    <div><span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{q.year}</span></div>
                    <div className="text-xs text-slate-700 pr-3 leading-relaxed">{q.text}</div>
                    <div><span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{q.category}</span></div>
                    <div className="text-center text-amber-500 text-sm">{q.important ? "★" : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JURIDIQUE */}
          {activeTab === "juridique" && (
            <div>
              <p className="text-sm text-slate-400 mb-4">Méthode PRSJ · Présente 10/10 sessions — cliquer pour voir le détail</p>
              {JURIDIQUE.map((c, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm mb-3 overflow-hidden">
                  <button onClick={() => toggleCase(i)} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 text-left">
                    <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded shrink-0">{c.year}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{c.situation}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.droit}</div>
                    </div>
                    <span className="text-slate-400 text-lg">{expandedCases[i] ? "−" : "+"}</span>
                  </button>
                  {expandedCases[i] && (
                    <div className="px-4 pb-4 space-y-2 border-t border-slate-50">
                      {[{lbl:"P", color:"bg-blue-600", title:"Problème", text:c.p}, {lbl:"R", color:"bg-blue-600", title:"Règles", text:c.r}, {lbl:"S", color:"bg-green-600", title:"Solution", text:c.s}].map((row, ri) => (
                        <div key={ri} className="flex gap-3 mt-2">
                          <span className={`text-[10px] font-bold text-white ${row.color} px-2 py-1 rounded shrink-0 mt-0.5`}>{row.lbl}</span>
                          <span className="text-xs text-slate-600 leading-relaxed"><strong>{row.title} :</strong> {row.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PREDICTION */}
          {activeTab === "prediction" && (
            <div>
              <p className="text-sm text-slate-400 mb-5">Analyse basée sur les cycles thématiques et l'actualité économique 2025–2026</p>
              {PREDICTIONS.map((p, i) => (
                <div key={i} className={`bg-white rounded-xl border-l-4 ${levelBorder(p.level)} border border-slate-100 shadow-sm p-5 mb-4`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="font-bold text-slate-800">{p.title}</div>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full shrink-0 ${levelBadge(p.level)}`}>{p.prob}%</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{p.reasoning}</p>
                  <div className="bg-slate-50 border-l-2 border-blue-400 px-3 py-2 rounded-r text-xs text-slate-600 mb-3 leading-relaxed">
                    <strong>Question type :</strong> {p.question}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-xs text-slate-400 w-20">Probabilité</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${p.prob}%`, background: LEVEL_COLORS[p.level]}} />
                    </div>
                    <div className="text-sm font-bold" style={{color: LEVEL_COLORS[p.level]}}>{p.prob}%</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                {TIMELINE.map((t, i) => (
                  <div key={i} className="grid grid-cols-[70px_1fr] gap-4 px-5 py-4">
                    <div className="text-sm font-bold text-blue-600 bg-blue-50 rounded-lg flex items-center justify-center">{t.year}</div>
                    <div>
                      <div className="text-xs text-slate-700 leading-relaxed">{t.themes}</div>
                      <div className="text-[11px] text-amber-500 italic mt-1">{t.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}