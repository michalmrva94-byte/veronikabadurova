import { ResultsImportWizard } from "@/components/admin/ResultsImportWizard"

export default function ResultsImportPage() {
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Import výsledkov SZPS</h1>
        <p className="text-sm text-muted-foreground mt-1">Importuj výsledky z pretekov vo formáte CSV alebo XLSX.</p>
      </div>
      <ResultsImportWizard />
    </div>
  )
}
