// Gestion de la progression liée au compte utilisateur (userId)
// La clé inclut l'userId pour isoler la progression par compte

const KEY_PREFIX = "bts_progress_v2_";

function getKey(userId) {
  return `${KEY_PREFIX}${userId || "anonymous"}`;
}

const read = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getKey(userId))) || {};
  } catch {
    return {};
  }
};

const write = (userId, data) => {
  localStorage.setItem(getKey(userId), JSON.stringify(data));
};

export const getProgress = (subject, userId) => {
  const d = read(userId);
  return d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
};

export const saveScore = (subject, mode, score, total, userId) => {
  const d = read(userId);
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].scores[mode] = { score, total, at: Date.now() };
  write(userId, d);
};

export const saveBestInfini = (subject, score, userId) => {
  const d = read(userId);
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  if (score > (d[subject].bestInfini || 0)) {
    d[subject].bestInfini = score;
    write(userId, d);
  }
};

export const markFlashcard = (subject, id, known, userId) => {
  const d = read(userId);
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].flashcards[id] = { known, at: Date.now() };
  write(userId, d);
};

export const saveFreeAnswer = (subject, id, answer, userId) => {
  const d = read(userId);
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].freeAnswers[id] = { answer, at: Date.now() };
  write(userId, d);
};