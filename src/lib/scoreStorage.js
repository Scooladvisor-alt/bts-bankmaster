// Gère la persistance des scores par chapitre, km record, score infini, et catégories vrai/faux
// Toutes les clés incluent l'userId pour isoler la progression par compte

import { getCachedUserId } from "@/lib/recordStorage";

function userKey(base, subject) {
  const uid = getCachedUserId();
  return `${base}_${subject}_u${uid}`;
}

export function saveParetoScore(subject, chapter, percentage) {
  const key = userKey("pareto_scores", subject);
  const scores = JSON.parse(localStorage.getItem(key) || "{}");
  scores[chapter] = percentage;
  localStorage.setItem(key, JSON.stringify(scores));
}

export function getParetoScores(subject) {
  const key = userKey("pareto_scores", subject);
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function getParetoScore(subject, chapter) {
  const scores = getParetoScores(subject);
  return scores[chapter] || null;
}

export function saveGameKmRecord(subject, km) {
  const key = userKey("game_km", subject);
  const current = parseInt(localStorage.getItem(key) || "0");
  if (km > current) {
    localStorage.setItem(key, Math.floor(km).toString());
    return Math.floor(km);
  }
  return current;
}

export function getGameKmRecord(subject) {
  const key = userKey("game_km", subject);
  return parseInt(localStorage.getItem(key) || "0");
}

export function saveInfiniRecord(subject, score) {
  const key = userKey("infini_record", subject);
  const current = parseInt(localStorage.getItem(key) || "0");
  if (score > current) {
    localStorage.setItem(key, score.toString());
    return score;
  }
  return current;
}

export function getInfiniRecord(subject) {
  const key = userKey("infini_record", subject);
  return parseInt(localStorage.getItem(key) || "0");
}

export function saveVraiOuFauxCategoryScore(subject, category, percentage) {
  const key = userKey("vof_category", subject);
  const scores = JSON.parse(localStorage.getItem(key) || "{}");
  scores[category] = percentage;
  localStorage.setItem(key, JSON.stringify(scores));
}

export function getVraiOuFauxCategoryScores(subject) {
  const key = userKey("vof_category", subject);
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function getVraiOuFauxCategoryScore(subject, category) {
  const scores = getVraiOuFauxCategoryScores(subject);
  return scores[category] || null;
}

// Obtenir la couleur basée sur le score (0-100%)
export function getScoreColor(percentage) {
  if (percentage === null) return "text-stone-400";
  if (percentage < 20) return "text-red-600";
  if (percentage < 40) return "text-orange-600";
  if (percentage < 60) return "text-yellow-600";
  if (percentage < 80) return "text-blue-600";
  return "text-green-600";
}

export function getScoreBgColor(percentage) {
  if (percentage === null) return "bg-stone-100";
  if (percentage < 20) return "bg-red-100";
  if (percentage < 40) return "bg-orange-100";
  if (percentage < 60) return "bg-yellow-100";
  if (percentage < 80) return "bg-blue-100";
  return "bg-green-100";
}