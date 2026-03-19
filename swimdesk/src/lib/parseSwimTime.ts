/**
 * Parses a swim time string to milliseconds.
 * Accepts: "1:02.34" (MM:SS.ss) or "59.84" (SS.ss)
 */
export function parseSwimTime(s: string): number | null {
  const trimmed = s.trim()

  // MM:SS.ss
  const mmss = /^(\d{1,2}):(\d{2})\.(\d{2})$/.exec(trimmed)
  if (mmss) {
    const minutes = parseInt(mmss[1], 10)
    const seconds = parseInt(mmss[2], 10)
    const centiseconds = parseInt(mmss[3], 10)
    return (minutes * 60 + seconds) * 1000 + centiseconds * 10
  }

  // SS.ss
  const ss = /^(\d{1,2})\.(\d{2})$/.exec(trimmed)
  if (ss) {
    const seconds = parseInt(ss[1], 10)
    const centiseconds = parseInt(ss[2], 10)
    return seconds * 1000 + centiseconds * 10
  }

  return null
}

/** Validates that a string is a parseable swim time */
export function isValidSwimTime(s: string): boolean {
  return parseSwimTime(s) !== null
}
