import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format swim time from milliseconds → "1:02.34" */
export function formatSwimTime(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const secStr = seconds.toFixed(2).padStart(5, "0")
  return minutes > 0 ? `${minutes}:${secStr}` : `${seconds.toFixed(2)}`
}

/** Slovak day of week display names */
export const DAY_NAMES: Record<string, string> = {
  pondelok: "Pondelok",
  utorok: "Utorok",
  streda: "Streda",
  stvrtok: "Štvrtok",
  piatok: "Piatok",
  sobota: "Sobota",
  nedela: "Nedeľa",
}

export const DAY_ORDER = ["pondelok", "utorok", "streda", "stvrtok", "piatok", "sobota", "nedela"]

/** Group colors for Benjamíni → Seniori */
export const GROUP_COLORS: Record<string, string> = {
  benjamini: "#22D3EE",
  ziaci:     "#0EA5E9",
  juniori:   "#0284C7",
  seniori:   "#1E40AF",
}

export const GROUP_DISPLAY: Record<string, string> = {
  benjamini: "Benjamíni",
  ziaci:     "Žiaci",
  juniori:   "Juniori",
  seniori:   "Seniori",
}

export const DISCIPLINE_DISPLAY: Record<string, string> = {
  volny:      "Voľný spôsob",
  znak:       "Znak",
  prsia:      "Prsia",
  motyl:      "Motýlik",
  kombinacia: "Kombinácia",
}
