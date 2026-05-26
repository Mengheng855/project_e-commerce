export function Pagination({ currentPage = 1, onPageChange, perPage = 10, total = 0 }) {
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total ? (currentPage - 1) * perPage + 1 : 0
  const to = Math.min(currentPage * perPage, total)
  const label = total ? 'Showing ' + from + '-' + to + ' of ' + total : 'No records'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-slate-300 px-3 py-1 font-bold disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          Previous
        </button>
        <span className="rounded-md bg-slate-100 px-3 py-1 font-black text-slate-700">{currentPage} / {lastPage}</span>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 font-bold disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}
