import { useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResultsImportPreview } from "./ResultsImportPreview"
import { useResultsImport, type ResultRow, type ImportStats } from "@/hooks/useResultsImport"
import { useResults } from "@/hooks/useResults"
import { useClubContext } from "@/contexts/ClubContext"
import { Upload, CheckCircle } from "lucide-react"
import { toast } from "sonner"

type Step = "upload" | "map" | "preview" | "done"

const REQUIRED = ["competition_name", "swimmer_name", "discipline", "distance_m", "result_time"] as const
const OPTIONAL = ["competition_date", "location", "place", "is_personal_record"] as const
const ALL_FIELDS = [...REQUIRED, ...OPTIONAL]

const FIELD_LABELS: Record<string, string> = {
  competition_name: "Meno pretekov *",
  swimmer_name: "Meno plavca *",
  discipline: "Disciplína *",
  distance_m: "Vzdialenosť (m) *",
  result_time: "Čas *",
  competition_date: "Dátum",
  location: "Miesto",
  place: "Poradie",
  is_personal_record: "Osobný rekord (true/false)",
}

export function ResultsImportWizard() {
  const { club } = useClubContext()
  const { data: existingResults } = useResults(club?.id)
  const importMutation = useResultsImport()

  const [step, setStep] = useState<Step>("upload")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [fieldMap, setFieldMap] = useState<Partial<Record<string, string>>>({})
  const [skipped, setSkipped] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<ImportStats | null>(null)

  const existingKeys = new Set(
    existingResults?.map((r) => `${r.swimmer_name}|${r.competition_name}|${r.discipline}|${r.distance_m}`) ?? []
  )

  const parseFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, unknown>[]
        const headers = Object.keys(jsonData[0] ?? {})
        setCsvHeaders(headers)
        setRawRows(jsonData.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))))
        autoMap(headers)
        setStep("map")
      }
      reader.readAsArrayBuffer(file)
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const headers = res.meta.fields ?? []
          setCsvHeaders(headers)
          setRawRows(res.data as Record<string, string>[])
          autoMap(headers)
          setStep("map")
        },
      })
    }
  }

  const autoMap = (headers: string[]) => {
    const map: Record<string, string> = {}
    headers.forEach((h) => {
      const l = h.toLowerCase()
      if (l.includes("pretek") || l.includes("compet") || l.includes("nazov")) map.competition_name = h
      if (l.includes("meno") || l.includes("plavec") || l.includes("swimmer")) map.swimmer_name = h
      if (l.includes("disciplin")) map.discipline = h
      if (l.includes("vzd") || l.includes("dist") || l.includes("meter")) map.distance_m = h
      if (l.includes("cas") || l.includes("time") || l.includes("vysledok")) map.result_time = h
      if (l.includes("datum") || l.includes("date")) map.competition_date = h
      if (l.includes("miesto") || l.includes("location")) map.location = h
      if (l.includes("porad") || l.includes("place") || l.includes("rank")) map.place = h
    })
    setFieldMap(map)
  }

  const mappedRows: ResultRow[] = rawRows.map((row) => ({
    competition_name: row[fieldMap.competition_name ?? ""] ?? "",
    swimmer_name: row[fieldMap.swimmer_name ?? ""] ?? "",
    discipline: (row[fieldMap.discipline ?? ""] ?? "").toLowerCase(),
    distance_m: parseInt(row[fieldMap.distance_m ?? ""] ?? "0", 10),
    result_time: row[fieldMap.result_time ?? ""] ?? "",
    competition_date: fieldMap.competition_date ? row[fieldMap.competition_date] : new Date().toISOString().slice(0, 10),
    location: fieldMap.location ? row[fieldMap.location] : undefined,
    place: fieldMap.place ? parseInt(row[fieldMap.place] ?? "", 10) || undefined : undefined,
    is_personal_record: fieldMap.is_personal_record ? row[fieldMap.is_personal_record]?.toLowerCase() === "true" : false,
  }))

  const toggleSkip = (i: number) => {
    setSkipped((prev) => {
      const next = new Set(prev)
      if (next.has(String(i))) next.delete(String(i))
      else next.add(String(i))
      return next
    })
  }

  const handleImport = async () => {
    const stats = await importMutation.mutateAsync({ rows: mappedRows, skipIds: skipped })
    setResult(stats)
    setStep("done")
    toast.success(`Importovaných ${stats.inserted} výsledkov`)
  }

  const reset = () => {
    setStep("upload")
    setCsvHeaders([])
    setRawRows([])
    setFieldMap({})
    setSkipped(new Set())
    setResult(null)
  }

  // Step indicator
  const STEPS = ["Nahranie", "Mapovanie", "Náhľad", "Hotovo"]
  const stepIndex = { upload: 0, map: 1, preview: 2, done: 3 }[step]

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`text-xs ${i === stepIndex ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {step === "upload" && (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted/30 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) parseFile(file)
          }}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Presuň CSV alebo XLSX súbor sem</p>
          <label className="mt-3 inline-block">
            <Button type="button" variant="outline" size="sm" asChild>
              <span>Vybrať súbor</span>
            </Button>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) parseFile(file)
            }} />
          </label>
        </div>
      )}

      {step === "map" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{rawRows.length} riadkov načítaných</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_FIELDS.map((field) => (
              <div key={field} className="space-y-1">
                <Label className="text-xs">{FIELD_LABELS[field]}</Label>
                <select
                  value={fieldMap[field] ?? ""}
                  onChange={(e) => setFieldMap((m) => ({ ...m, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Nevybrané —</option>
                  {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              disabled={REQUIRED.some((f) => !fieldMap[f])}
              onClick={() => { setSkipped(new Set()); setStep("preview") }}
            >
              Ďalej → Náhľad
            </Button>
            <Button variant="outline" onClick={reset}>Zrušiť</Button>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <ResultsImportPreview rows={mappedRows} existingKeys={existingKeys} onSkipToggle={toggleSkip} skipped={skipped} />
          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={importMutation.isPending}>
              {importMutation.isPending ? "Importujem…" : "Importovať"}
            </Button>
            <Button variant="outline" onClick={() => setStep("map")}>Späť</Button>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <div className="text-center py-10 space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h3 className="text-lg font-bold">Import dokončený</h3>
          <p className="text-muted-foreground">
            Importovaných: <strong>{result.inserted}</strong> · Preskočených: <strong>{result.skipped}</strong>
          </p>
          <Button onClick={reset}>Nový import</Button>
        </div>
      )}
    </div>
  )
}
