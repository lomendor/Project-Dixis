'use client'
import { useState } from 'react'

export function CopyTrackingLink({ publicToken }: { publicToken?: string }) {
  const [copied, setCopied] = useState(false)

  if (!publicToken) return null

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/track/${publicToken}`
    : `/track/${publicToken}`

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      }
    } catch (_e) {}

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-live="polite"
      >
        {copied ? '✓ Αντιγράφηκε!' : 'Αντιγραφή συνδέσμου'}
      </button>
      <div className="mt-1 text-xs text-gray-500">{url}</div>
    </div>
  )
}
