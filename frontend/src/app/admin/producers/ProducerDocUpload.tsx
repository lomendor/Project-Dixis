'use client'

import { useState, useRef } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface Props {
  producerId: string
  label: string
  fieldName: 'tax_registration_doc' | 'efet_notification_doc' | 'haccp_declaration_doc' | 'producer_image'
  currentUrl: string | null
  onUploaded: (newUrl: string) => void
}

export default function ProducerDocUpload({ producerId, label, fieldName, currentUrl, onUploaded }: Props) {
  const { showSuccess, showError } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      const res = await fetch(`/api/admin/producers/${producerId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Upload failed')
      }

      const data = await res.json()
      // Find the uploaded URL from the returned producer
      const urlField = fieldName === 'producer_image' ? 'image_url' : fieldName + '_url'
      const newUrl = data.producer?.[urlField] || currentUrl
      showSuccess(`${label}: Ανέβηκε`)
      onUploaded(newUrl)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Upload error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 min-w-[140px]">{label}:</span>
      {currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Προβολή
        </a>
      ) : (
        <span className="text-gray-400">Δεν ανέβηκε</span>
      )}
      <label className={`ml-auto px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
        uploading
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}>
        {uploading ? 'Ανέβασμα...' : currentUrl ? 'Αντικατάσταση' : 'Ανέβασμα'}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
        />
      </label>
    </div>
  )
}
