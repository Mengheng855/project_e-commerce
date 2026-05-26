import { useEffect, useRef, useState } from 'react'

export function ScrollableTable({ children }) {
  const scrollRef = useRef(null)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    const scrollElement = scrollRef.current

    function checkOverflow() {
      if (!scrollElement) {
        return
      }

      setCanScroll(scrollElement.scrollWidth > scrollElement.clientWidth + 1)
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)

    return () => {
      window.removeEventListener('resize', checkOverflow)
    }
  }, [children])

  function scrollBy(amount) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="max-w-full overflow-x-auto" ref={scrollRef}>
        {children}
      </div>
      {canScroll ? (
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3">
          <button
            aria-label="Scroll table left"
            className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 hover:border-teal-800 hover:text-teal-800"
            onClick={() => scrollBy(-420)}
            type="button"
          >
            ← Left
          </button>
          <button
            aria-label="Scroll table right"
            className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-black text-slate-700 hover:border-teal-800 hover:text-teal-800"
            onClick={() => scrollBy(420)}
            type="button"
          >
            Right →
          </button>
        </div>
      ) : null}
    </div>
  )
}
