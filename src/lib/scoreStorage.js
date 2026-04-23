// Gère la persistance des scores par chapitre, km record, score infini, et catégories vrai/faux

export function saveParetoScore(subject, chapter, percentage) {
  const key = `pareto_scores_${subject}`;
  const scores = JSON.parse(localStorage.getItem(key) || "{}");
  scores[chapter] = percentage;
  localStorage.setItem(key, JSON.stringify(scores));
}

export function getParetoScores(subject) {
  const key = `pareto_scores_${subject}`;
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function getParetoScore(subject, chapter) {
  const scores = getParetoScores(subject);
  return scores[chapter] || null;
}

export function saveGameKmRecord(subject, km) {
  const key = `game_km_${subject}`;
  const current = parseInt(localStorage.getItem(key) || "0");
  if (km > current) {
    localStorage.setItem(key, Math.floor(km).toString());
    return Math.floor(km);
  }
  return current;
}

export function getGameKmRecord(subject) {
  const key = `game_km_${subject}`;
  return parseInt(localStorage.getItem(key) || "0");
}

export function saveInfiniRecord(subject, score) {
  const key = `infini_record_${subject}`;
  const current = parseInt(localStorage.getItem(key) || "0");
  if (score > current) {
    localStorage.setItem(key, score.toString());
    return score;
  }
  return current;
}

export function getInfiniRecord(subject) {
  // Also check new recordStorage key
  const key1 = `infini_record_${subject}`;
  const key2 = `record_infini_${subject}`;
  const v1 = parseInt(localStorage.getItem(key1) || "0");
  const v2 = parseInt(localStorage.getItem(key2) || "0");
  return Math.max(v1, v2);
}

export function saveVraiOuFauxCategoryScore(subject, category, percentage) {
  const key = `vof_category_${subject}`;
  const scores = JSON.parse(localStorage.getItem(key) || "{}");
  scores[category] = percentage;
  localStorage.setItem(key, JSON.stringify(scores));
}

export function getVraiOuFauxCategoryScores(subject) {
  const key = `vof_category_${subject}`;
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function getVraiOuFauxCategoryScore(subject, category) {
  const scores = getVraiOuFauxCategoryScores(subject);
  return scores[category] || null;
}

// Obtenir la couleur basée sur le score (0-100%)
export function getScoreColor(percentage) {
  if (percentage === null) return "text-stone-400"; // pas de score
  if (percentage < 20) return "text-red-600"; // rouge
  if (percentage < 40) return "text-orange-600"; // orange
  if (percentage < 60) return "text-yellow-600"; // jaune
  if (percentage < 80) return "text-blue-600"; // bleu
  return "text-green-600"; // vert
}

export function getScoreBgColor(percentage) {
  if (percentage === null) return "bg-stone-100"; // pas de score
  if (percentage < 20) return "bg-red-100"; // rouge
  if (percentage < 40) return "bg-orange-100"; // orange
  if (percentage < 60) return "bg-yellow-100"; // jaune
  if (percentage < 80) return "bg-blue-100"; // bleu
  return "bg-green-100"; // vert
}