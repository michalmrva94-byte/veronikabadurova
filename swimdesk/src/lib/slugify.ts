/** Slovak-aware slugify for news article slugs */
const SK_MAP: Record<string, string> = {
  á: "a", ä: "a", č: "c", ď: "d", é: "e", í: "i", ĺ: "l", ľ: "l",
  ň: "n", ó: "o", ô: "o", ŕ: "r", š: "s", ť: "t", ú: "u", ý: "y", ž: "z",
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áäčďéíĺľňóôŕšťúýž]/g, (c) => SK_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}
