const BANNED_WORDS = [
  "anjing", "babi", "bajingan", "brengsek", "kampret",
  "kontol", "memek", "ngentot", "ngewe", "pepek",
  "tolol", "goblok", "bodoh", "idiot", "bego",
  "keparat", "setan", "iblis", "sialan", "taik",
  "tai", "kafir", "munafik", "laknat", "celaka",
  "sampah", "dajjal", "jancok", "asu", "cuk",
];

export function checkProfanity(text: string): { hasProfanity: boolean; foundWords: string[] } {
  const lower = text.toLowerCase();
  const found = BANNED_WORDS.filter((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
  return {
    hasProfanity: found.length > 0,
    foundWords: found,
  };
}

export function maskProfanity(text: string): string {
  const lower = text.toLowerCase();
  let masked = text;
  BANNED_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    masked = masked.replace(regex, (match) => "*".repeat(match.length));
  });
  return masked;
}
