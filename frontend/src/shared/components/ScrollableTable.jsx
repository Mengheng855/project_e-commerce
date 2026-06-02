export function ScrollableTable({ children }) {
  return (
    <div className="max-w-full min-w-0 overflow-hidden">
      <div
        className="max-w-full min-w-0 overflow-x-scroll overflow-y-hidden pb-3 [scrollbar-color:#94a3b8_#e5e7eb] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-slate-200 [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-track]:bg-slate-200"
      >
        <div className="min-w-[1120px]">
          {children}
        </div>
      </div>
    </div>
  )
}
