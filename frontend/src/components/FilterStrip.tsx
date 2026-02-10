'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface FilterStripProps {
  /** Display label for the filter group */
  label: string
  /** Available option values */
  options: string[]
  /** Currently selected value (null = all) */
  selected: string | null
  /** URL search parameter name (e.g. "region", "cat") */
  paramName: string
  /** Base path for navigation (e.g. "/producers") */
  basePath: string
}

export function FilterStrip({ label, options, selected, paramName, basePath }: FilterStripProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (options.length === 0) return null

  const handleClick = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  const pillBase =
    'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200'
  const pillActive = 'bg-green-600 text-white shadow-sm'
  const pillInactive =
    'bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:bg-green-50'

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
        {label}
      </span>
      <button
        onClick={() => handleClick(null)}
        className={`${pillBase} ${!selected ? pillActive : pillInactive}`}
      >
        {'Όλα'}
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleClick(opt)}
          className={`${pillBase} ${selected === opt ? pillActive : pillInactive}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
