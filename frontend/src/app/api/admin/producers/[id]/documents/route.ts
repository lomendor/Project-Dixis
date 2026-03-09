import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/**
 * ADMIN-DOC-UPLOAD-01: Upload compliance documents for a producer
 * Proxies multipart form data to Laravel POST /admin/producers/{id}/documents
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (error) {
    return handleAdminError(error)
  }

  const { id: producerId } = await params

  if (!producerId) {
    return NextResponse.json({ error: 'Invalid producer ID' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const token = await getAdminToken()
    const laravelBase = getLaravelInternalUrl()
    const url = `${laravelBase}/admin/producers/${producerId}/documents`

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // Forward the FormData as-is to Laravel (no Content-Type — fetch sets it with boundary)
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Document upload failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      message: data.message || 'Documents uploaded',
      producer: data.producer,
      uploaded: data.uploaded,
    })
  } catch (error) {
    console.error('[Admin] Producer document upload proxy error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
