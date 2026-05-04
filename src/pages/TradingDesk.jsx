import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Trophy, Coins, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const BUDGET = 100;
const TODAY = new Date().toISOString().slice(0, 10);

// Seed déterministe du jour pour les mêmes 3 questions par jour
function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function seededRandom(seed, n) {
  const picks = [];
  let s = seed;
  while (picks.length < n) {
    s = (s * 9301 + 49297) % 233280;
    picks.push(s);
  }
  return picks;
}
function pickDailyQuestions(all, n = 3) {
  if (all.length <= n) return all;
  const seed = getDailySeed();
  const randoms = seededRandom(seed, n);
  const indices = randoms.map(r => r % all.length);
  const seen = new Set();
  const result = [];
  for (const idx of indices) {
    if (!seen.has(idx)) { seen.add(idx); result.push(all[idx]); }
  }
  while (result.length < n) {
    const i = result.length;
    if (!seen.has(i)) { seen.add(i); result.push(all[i]); }
  }
  return result;
}

// ── BetSlider ────────────────────────────────────────────────────────────────
function BetSlider({ label, value, onChange, color, disabled }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value} <span className="text-gray-500 font-normal text-xs">coins</span></span>
      </div>
      <input
        type="range" min={0} max={BUDGET} step={5}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color === "text-green-400" ? "#4ade80" : color === "text-red-400" ? "#f87171" : "#60a5fa" }}
      />
      <div className="flex gap-1.5 mt-1.5">
        {[0, 25, 50, 75, 100].map(v => (
          <button key={v} disabled={disabled} onClick={() => onChange(v)}
            className="flex-1 text-[10px] font-bold py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors disabled:opacity-40">
            {v === 0 ? "0" : v === 100 ? "Max" : `${v}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── TradeCard ────────────────────────────────────────────────────────────────
function TradeCard({ question, qIndex, total, onResult, coins }) {
  const n = (question.options || []).length;
  const [bets, setBets] = useState(Array(n).fill(0));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const totalBet = bets.reduce((a, b) => a + b, 0);
  const remaining = BUDGET - totalBet;

  const setBet = (i, val) => {
    if (submitted) return;
    const others = bets.reduce((a, b, idx) => idx === i ? a : a + b, 0);
    const capped = Math.min(val, BUDGET - others);
    const next = [...bets];
    next[i] = capped;
    setBets(next);
  };

  const handleSubmit = () => {
    if (totalBet !== BUDGET || submitted) return;
    const correctIdx = question.correct_index;
    const gain = bets[correctIdx] * 2;
    const lost = bets.reduce((a, b, i) => i !== correctIdx ? a + b : a, 0);
    const net = gain - BUDGET;
    setResult({ gain, lost, net, correctIdx });
    setSubmitted(true);
  };

  const COLORS = ["text-blue-400", "text-purple-400", "text-yellow-400"];
  const OPTION_LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-3xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
            🎯 Daily #{qIndex + 1}/{total}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-sm">
          <span>🪙</span> {coins} coins
        </div>
      </div>

      {/* Thème */}
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
        Thème {question.theme_number} — {question.theme_label}
      </div>

      {/* Question */}
      <p className="text-white font-semibold text-base leading-relaxed mb-6">{question.question}</p>

      {/* Options */}
      <div className="space-y-2 mb-5">
        {(question.options || []).map((opt, i) => {
          let cls = "w-full text-left px-4 py-3 rounded-xl border transition-all flex items-start gap-3 text-sm ";
          if (!submitted) {
            cls += bets[i] > 0
              ? "border-green-500/40 bg-green-500/5 text-gray-200"
              : "border-gray-700 bg-gray-800/50 text-gray-400";
          } else if (i === result.correctIdx) {
            cls += "border-green-400 bg-green-400/10 text-green-300";
          } else if (bets[i] > 0) {
            cls += "border-red-500/40 bg-red-500/10 text-red-400";
          } else {
            cls += "border-gray-700 bg-gray-800/30 text-gray-600";
          }
          return (
            <div key={i} className={cls}>
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                ${submitted && i === result.correctIdx ? "border-green-400 bg-green-400 text-black"
                  : submitted && bets[i] > 0 ? "border-red-400 bg-red-400/20 text-red-400"
                  : "border-gray-600 text-gray-500"}`}>
                {OPTION_LETTERS[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {submitted && i === result.correctIdx && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-green-400 font-bold text-xs shrink-0">✓ CORRECT</motion.span>
              )}
              {submitted && bets[i] > 0 && i !== result.correctIdx && (
                <span className="text-red-400 font-bold text-xs shrink-0">🔥 -{bets[i]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Sliders de mise */}
      {!submitted && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Répartir {BUDGET} coins</span>
            <span className={`text-xs font-bold ${remaining === 0 ? "text-green-400" : remaining > 0 ? "text-yellow-400" : "text-red-400"}`}>
              {remaining === 0 ? "✓ Prêt" : `Reste : ${remaining}`}
            </span>
          </div>
          {(question.options || []).map((_, i) => (
            <BetSlider
              key={i}
              label={`Option ${OPTION_LETTERS[i]}`}
              value={bets[i]}
              color={COLORS[i] || "text-gray-400"}
              disabled={submitted}
              onChange={v => setBet(i, v)}
            />
          ))}
          <button
            onClick={handleSubmit}
            disabled={totalBet !== BUDGET}
            className="w-full mt-2 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all
              bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg shadow-green-500/20
              hover:from-green-400 hover:to-emerald-500 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            ⚡ Valider mon Trade
          </button>
        </div>
      )}

      {/* Résultat */}
      {submitted && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`rounded-2xl p-4 mb-4 border ${result.net >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white text-sm">Résultat du Trade</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}
                className={`text-2xl font-bold ${result.net >= 0 ? "text-green-400" : "text-red-400"}`}>
                {result.net >= 0 ? "+" : ""}{result.net} coins
              </motion.span>
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">
              Gain : <span className="text-green-400 font-bold">+{result.gain}</span> · Pertes : <span className="text-red-400 font-bold">-{result.lost}</span>
            </div>
            {question.explanation && (
              <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 leading-relaxed">{question.explanation}</div>
            )}
          </div>
          <button onClick={() => onResult(result.net)}
            className="w-full py-3 rounded-2xl font-bold text-sm bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 transition-all">
            {qIndex + 1 < total ? "Trade suivant →" : "🏁 Voir le bilan"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BtsCoinScore.list("-coins", 10).then(list => {
      setScores(list || []);
      setLoading(false);
    });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-3xl p-5">
      <h3 className="font-fredoka text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Wall of Fame
      </h3>
      {loading ? (
        <div className="text-center py-6 text-gray-500 text-sm">Chargement…</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-6 text-gray-600 text-sm">Sois le premier à trader ! 🚀</div>
      ) : (
        <div className="space-y-2">
          {scores.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${i === 0 ? "bg-yellow-400/10 border border-yellow-400/20" : "bg-gray-800/50"}`}>
              <span className="text-lg w-7 shrink-0">{medals[i] || `#${i + 1}`}</span>
              <span className="flex-1 text-sm font-bold text-gray-200 truncate">{s.userName || s.userEmail || "Anonyme"}</span>
              <span className="text-yellow-400 font-bold text-sm shrink-0">🪙 {s.coins}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function TradingDesk() {
  const [user, setUser] = useState(null);
  const [scoreRecord, setScoreRecord] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qIndex, setQIndex] = useState(0);
  const [sessionGains, setSessionGains] = useState([]);
  const [finished, setFinished] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [tab, setTab] = useState("trade"); // "trade" | "leaderboard"

  useEffect(() => {
    (async () => {
      let me = null;
      try { me = await base44.auth.me(); } catch {}
      setUser(me);

      // Load questions
      const qs = await base44.entities.AmfQuestion.list("theme_number", 200);
      setQuestions(pickDailyQuestions(qs, 3));

      // Load or create score
      if (me) {
        const existing = await base44.entities.BtsCoinScore.filter({ userId: me.id }, null, 1);
        if (existing && existing.length > 0) {
          setScoreRecord(existing[0]);
          if (existing[0].lastPlayedDate === TODAY) setAlreadyPlayed(true);
        } else {
          const created = await base44.entities.BtsCoinScore.create({
            userId: me.id,
            userEmail: me.email,
            userName: me.full_name || me.email,
            coins: 500,
            lastPlayedDate: "",
          });
          setScoreRecord(created);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleResult = async (net) => {
    const gains = [...sessionGains, net];
    setSessionGains(gains);

    // Update score in DB
    if (scoreRecord) {
      const newCoins = Math.max(0, (scoreRecord.coins || 500) + net);
      const updated = await base44.entities.BtsCoinScore.update(scoreRecord.id, {
        coins: newCoins,
        lastPlayedDate: TODAY,
      });
      setScoreRecord(updated);
    }

    if (qIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQIndex(i => i + 1);
    }
  };

  const totalNet = sessionGains.reduce((a, b) => a + b, 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/cesbf/amf" className="p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-green-400">AMF · Daily Challenge</div>
            <h1 className="font-fredoka text-lg font-bold text-white">Le Trading Desk 📈</h1>
          </div>
          {scoreRecord && (
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
              <span>🪙</span>
              <span className="font-bold text-yellow-400 text-sm">{scoreRecord.coins}</span>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-2">
          {[{ key: "trade", label: "⚡ Daily Trade" }, { key: "leaderboard", label: "🏆 Classement" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tab === t.key ? "bg-green-500 text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === "leaderboard" && <Leaderboard />}

        {tab === "trade" && (
          <>
            {!user && (
              <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 text-center mb-6">
                <div className="text-3xl mb-2">🔐</div>
                <div className="font-bold text-white mb-1">Connexion requise</div>
                <div className="text-sm text-gray-400 mb-4">Connecte-toi pour sauvegarder tes coins et apparaître au classement.</div>
                <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-2.5 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-all">
                  Se connecter
                </button>
              </div>
            )}

            {alreadyPlayed && !finished && (
              <div className="bg-gray-900 border border-yellow-500/30 rounded-3xl p-6 text-center mb-6">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-fredoka text-xl font-bold text-yellow-400 mb-1">Daily déjà joué !</div>
                <div className="text-sm text-gray-400">Tu as déjà tradé aujourd'hui. Reviens demain pour de nouvelles questions.</div>
                <div className="mt-4 text-gray-500 text-xs">Solde actuel : <span className="text-yellow-400 font-bold">{scoreRecord?.coins} coins</span></div>
              </div>
            )}

            {!alreadyPlayed && !finished && questions.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div key={qIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <TradeCard
                    question={questions[qIndex]}
                    qIndex={qIndex}
                    total={questions.length}
                    coins={scoreRecord?.coins ?? 500}
                    onResult={handleResult}
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {finished && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-gray-700 rounded-3xl p-6 text-center">
                <div className="text-5xl mb-4">{totalNet >= 0 ? "🚀" : "📉"}</div>
                <div className="font-fredoka text-2xl font-bold text-white mb-1">Session terminée !</div>
                <div className={`text-3xl font-bold mb-2 ${totalNet >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalNet >= 0 ? "+" : ""}{totalNet} coins
                </div>
                <div className="text-gray-400 text-sm mb-2">
                  Bilan : {sessionGains.map((g, i) => (
                    <span key={i} className={`font-bold mx-1 ${g >= 0 ? "text-green-400" : "text-red-400"}`}>{g >= 0 ? "+" : ""}{g}</span>
                  ))}
                </div>
                <div className="text-gray-500 text-xs mt-4">Nouveau solde : <span className="text-yellow-400 font-bold">{scoreRecord?.coins} 🪙</span></div>
                <button onClick={() => setTab("leaderboard")} className="mt-5 px-6 py-2.5 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all">
                  🏆 Voir le classement
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}