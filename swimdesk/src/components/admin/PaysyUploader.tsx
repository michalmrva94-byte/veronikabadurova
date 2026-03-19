import { useState, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaysyPreviewTable } from "./PaysyPreviewTable"
import { usePaysyImport, type PaysyRow } from "@/hooks/usePaysyImport"
import { useClubSwimmers } from "@/hooks/useSwimmers"
import { useClubContext } from "@/contexts/ClubContext"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

const REQUIRED_FIELDS = ["paysy_member_id", "full_name_csv", "status"] as const

type FieldMap = Record<(typeof REQUIRED_FIELDS[number]) | "season" | "valid_until", string>

export function PaysyUploader() {
  const { club } = useClubContext()
  const { data: swimmers } = useClubSwimmers(club?.id)
  const importMutation = usePaysyImport()

  const [step, setStep] = useState<"idle" | "map" | "preview">("idle")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [filename, setFilename] = useState<string>("")
  const [season, setSeason] = useState<string>("")
  const [fieldMap, setFieldMap] = useState<Partial<FieldMap>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const knownIds = new Set(swimmers?.map((s) => s.paysy_member_id).filter(Boolean) as string[])

  const handleFile = (file: File) => {
    setFilename(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        const headers = results.meta.fields ?? []
        setCsvHeaders(headers)
        setRawRows(results.data as Record<string, string>[])
        // Auto-map obvious column names
        const auto: Partial<FieldMap> = {}
        headers.forEach((h) => {
          const l = h.toLowerCase()
          if (l.includes("id") || l.includes("cislo")) auto.paysy_member_id = h
          if (l.includes("meno") || l.includes("name") || l.includes("priezvisko")) auto.full_name_csv = h
          if (l.includes("stav") || l.includes("status")) auto.status = h
          if (l.includes("sezon") || l.includes("season")) auto.season = h
          if (l.includes("platny") || l.includes("valid") || l.includes("do")) auto.valid_until = h
        })
        setFieldMap(auto)
        setStep("map")
      },
    })
  }

  const mappedRows: PaysyRow[] = rawRows.map((row) => ({
    paysy_member_id: row[fieldMap.paysy_member_id ?? ""] ?? "",
    full_name_csv: row[fieldMap.full_name_csv ?? ""] ?? "",
    status: (row[fieldMap.status ?? ""] ?? "").toLowerCase(),
    season: fieldMap.season ? row[fieldMap.season] : undefined,
    valid_until: fieldMap.valid_until ? row[fieldMap.valid_until] : undefined,
  })).filter((r) => r.paysy_member_id && r.full_name_csv)

  const handleImport = async () => {
    await importMutation.mutateAsync({ rows: mappedRows, filename, season: season || undefined })
    toast.success(`Importovaných ${mappedRows.length} záznamov`)
    setStep("idle")
    setRawRows([])
    setCsvHeaders([])
    setSeason("")
  }

  if (step === "idle") {
    return (
      <div
        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted/30 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Presuň CSV súbor sem alebo klikni na výber</p>
        <p className="text-xs text-muted-foreground mt-1">Podporovaný formát: CSV (UTF-8 alebo Windows-1250)</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }} />
      </div>
    )
  }

  if (step === "map") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Mapovanie stĺpcov</h3>
          <button onClick={() => setStep("idle")}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <p className="text-sm text-muted-foreground">Súbor: <strong>{filename}</strong> · {rawRows.length} riadkov</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(["paysy_member_id", "full_name_csv", "status", "season", "valid_until"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label className="text-xs">
                {field === "paysy_member_id" ? "ID člena *" : field === "full_name_csv" ? "Meno *" : field === "status" ? "Status *" : field === "season" ? "Sezóna" : "Platný do"}
              </Label>
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
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Sezóna (pre celý import)</Label>
            <Input placeholder="napr. 2025/2026" value={season} onChange={(e) => setSeason(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={!fieldMap.paysy_member_id || !fieldMap.full_name_csv || !fieldMap.status}
            onClick={() => setStep("preview")}
          >
            Ďalej → Náhľad
          </Button>
          <Button variant="outline" onClick={() => setStep("idle")}>Zrušiť</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Náhľad importu — {mappedRows.length} riadkov</h3>
        <button onClick={() => setStep("map")}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>

      <PaysyPreviewTable rows={mappedRows} knownIds={knownIds} />

      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={importMutation.isPending}>
          {importMutation.isPending ? "Importujem…" : `Importovať ${mappedRows.length} záznamov`}
        </Button>
        <Button variant="outline" onClick={() => setStep("map")}>Späť</Button>
      </div>
    </div>
  )
}
