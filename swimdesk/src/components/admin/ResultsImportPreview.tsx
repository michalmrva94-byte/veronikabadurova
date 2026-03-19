import { useState } from "react"
import { isValidSwimTime } from "@/lib/parseSwimTime"
import { DISCIPLINE_DISPLAY } from "@/lib/utils"
import type { ResultRow } from "@/hooks/useResultsImport"

const VALID_DISCIPLINES = ["volny", "znak", "prsia", "motyl", "kombinacia"]

interface ValidationResult {
  valid: boolean
  errors: string[]
  duplicate: boolean
}

function validateRow(row: ResultRow, existingKeys: Set<string>): ValidationResult {
  const errors: string[] = []
  if (!row.competition_name) errors.push("Chýba meno pretekov")
  if (!row.swimmer_name) errors.push("Chýba meno plavca")
  if (!VALID_DISCIPLINES.includes(row.discipline)) errors.push("Neplatná disciplína")
  if (!row.distance_m || row.distance_m <= 0) errors.push("Neplatná vzdialenosť")
  if (!isValidSwimTime(row.result_time)) errors.push("Neplatný čas")

  const key = `${row.swimmer_name}|${row.competition_name}|${row.discipline}|${row.distance_m}`
  const duplicate = existingKeys.has(key)

  return { valid: errors.length === 0 && !duplicate, errors, duplicate }
}

interface Props {
  rows: ResultRow[]
  existingKeys: Set<string>
  onSkipToggle: (index: number) => void
  skipped: Set<string>
}

export function ResultsImportPreview({ rows, existingKeys, onSkipToggle, skipped }: Props) {
  const validations = rows.map((r) => validateRow(r, existingKeys))
  const valid = validations.filter((v) => v.valid).length
  const invalid = validations.filter((v) => !v.valid && !v.duplicate).length
  const duplicate = validations.filter((v) => v.duplicate).length

  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-sm">
        <span className="text-green-600 font-medium">{valid} platných</span>
        <span className="text-red-600 font-medium">{invalid} neplatných</span>
        <span className="text-yellow-600 font-medium">{duplicate} duplikátov</span>
      </div>

      <div className="overflow-x-auto rounded-lg border max-h-96 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="text-left px-2 py-2 font-medium">Preskočiť</th>
              <th className="text-left px-2 py-2 font-medium">Meno plavca</th>
              <th className="text-left px-2 py-2 font-medium">Preteky</th>
              <th className="text-left px-2 py-2 font-medium">Disciplína</th>
              <th className="text-left px-2 py-2 font-medium">m</th>
              <th className="text-left px-2 py-2 font-medium">Čas</th>
              <th className="text-left px-2 py-2 font-medium">Miesto</th>
              <th className="text-left px-2 py-2 font-medium">Stav</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const v = validations[i]
              const isSkipped = skipped.has(String(i))
              let rowClass = ""
              if (isSkipped) rowClass = "opacity-40"
              else if (v.duplicate) rowClass = "bg-yellow-50"
              else if (!v.valid) rowClass = "bg-red-50"

              return (
                <tr key={i} className={`border-t ${rowClass}`}>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSkipped}
                      onChange={() => onSkipToggle(i)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1.5">{row.swimmer_name}</td>
                  <td className="px-2 py-1.5 max-w-32 truncate">{row.competition_name}</td>
                  <td className="px-2 py-1.5">{DISCIPLINE_DISPLAY[row.discipline] ?? row.discipline}</td>
                  <td className="px-2 py-1.5">{row.distance_m}</td>
                  <td className="px-2 py-1.5 font-mono">{row.result_time}</td>
                  <td className="px-2 py-1.5">{row.place ?? "—"}</td>
                  <td className="px-2 py-1.5">
                    {v.duplicate && !isSkipped && <span className="text-yellow-600 font-medium">Duplikát</span>}
                    {!v.valid && !v.duplicate && <span className="text-red-600" title={v.errors.join(", ")}>⚠ {v.errors[0]}</span>}
                    {v.valid && <span className="text-green-600">✓</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
