'use client'

import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  value?: string
  onChange: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Αναζήτηση σε μέλι, λάδι, βότανα...',
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-10 pr-10 text-base bg-white border border-gray-200 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-dixis-green focus:border-transparent
                   placeholder:text-gray-400"
        data-testid="search-input"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                     text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Καθαρισμός αναζήτησης"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
