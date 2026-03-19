import type { PaysyRow } from "@/hooks/usePaysyImport"

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  expired: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
}

interface Props {
  rows: PaysyRow[]
  knownIds: Set<string>
}

export function PaysyPreviewTable({ rows, knownIds }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-3 py-2 font-medium">ID</th>
            <th className="text-left px-3 py-2 font-medium">Meno</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
            <th className="text-left px-3 py-2 font-medium">Sezóna</th>
            <th className="text-left px-3 py-2 font-medium">Platný do</th>
            <th className="text-left px-3 py-2 font-medium">Napárovaný</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const matched = knownIds.has(row.paysy_member_id)
            return (
              <tr key={i} className={`border-t ${!matched ? "bg-amber-50" : ""}`}>
                <td className="px-3 py-2 font-mono text-xs">{row.paysy_member_id}</td>
                <td className="px-3 py-2">{row.full_name_csv}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{row.season ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.valid_until ?? "—"}</td>
                <td className="px-3 py-2">
                  {matched
                    ? <span className="text-green-600 text-xs font-medium">✓</span>
                    : <span className="text-amber-600 text-xs font-medium">Nenájdený</span>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
