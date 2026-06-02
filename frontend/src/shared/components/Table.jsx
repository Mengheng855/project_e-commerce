import { ScrollableTable } from './ScrollableTable'

export function Table({ children }) {
  return (
    <div className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
      <ScrollableTable>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        {children}
      </table>
      </ScrollableTable>
    </div>
  )
}
