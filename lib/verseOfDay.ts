import { VERSES } from "./verses";

export function getVerseOfDay() {
  const start = new Date(2024, 0, 1); // data base fixa
  const today = new Date();

  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = diff % VERSES.length;

  return VERSES[index];
}
