// Gestion de la progression côté navigateur (pas de compte requis)
const KEY = "bts_banque_progress_v1";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

const write = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const getProgress = (subject) => {
  const d = read();
  return d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
};

export const saveScore = (subject, mode, score, total) => {
  const d = read();
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].scores[mode] = { score, total, at: Date.now() };
  write(d);
};

export const saveBestInfini = (subject, score) => {
  const d = read();
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  if (score > (d[subject].bestInfini || 0)) {
    d[subject].bestInfini = score;
    write(d);
  }
};

export const markFlashcard = (subject, id, known) => {
  const d = read();
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].flashcards[id] = { known, at: Date.now() };
  write(d);
};

export const saveFreeAnswer = (subject, id, answer) => {
  const d = read();
  d[subject] = d[subject] || { scores: {}, flashcards: {}, freeAnswers: {}, bestInfini: 0 };
  d[subject].freeAnswers[id] = { answer, at: Date.now() };
  write(d);
};