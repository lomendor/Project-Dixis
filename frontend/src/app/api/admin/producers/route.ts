import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy'
import { getLaravelInternalUrl } from '@/env'

/**
 * PRODUCER-ONBOARD-01: Admin producer list — proxy to Laravel SSOT
 */

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
  } catch (error) {
    return handleAdminError(error)
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'all'

  try {
    const token = await getAdminToken()
    const laravelBase = getLaravelInternalUrl()
    const url = new URL(`${laravelBase}/admin/producers`)
    url.searchParams.set('status', status)
    url.searchParams.set('per_page', '100')

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url.toString(), { headers, cache: 'no-store' })

    if (!res.ok) {
      return NextResponse.json({ error: 'Σφάλμα ανάκτησης παραγωγών' }, { status: res.status })
    }

    const json = await res.json()
    const producers = json?.data ?? []

    // Map Laravel status to frontend approval status
    // Laravel: pending/active/inactive → Frontend: pending/approved/rejected
    const mapStatus = (s: string): string => {
      if (s === 'active') return 'approved'
      if (s === 'inactive') return 'rejected'
      return 'pending'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = producers.map((p: any) => ({
      id: String(p.id),
      name: p.name || p.business_name || '',
      businessName: p.business_name || '',
      region: p.region || p.location || '',
      approvalStatus: mapStatus(p.status || 'pending'),
      isActive: p.is_active !== false,
      rejectionReason: p.rejection_reason || null,
      email: p.email || p.user?.email || '',
      phone: p.phone || '',
      description: p.description || '',
      city: p.city || '',
      taxId: p.tax_id || '',
      taxOffice: p.tax_office || '',
      address: p.address || '',
      postalCode: p.postal_code || '',
      createdAt: p.created_at,
      // Onboarding V2
      onboardingCompletedAt: p.onboarding_completed_at || null,
      productCategories: p.product_categories || [],
      taxRegistrationDocUrl: p.tax_registration_doc_url || null,
      efetNotificationDocUrl: p.efet_notification_doc_url || null,
      haccpDeclarationDocUrl: p.haccp_declaration_doc_url || null,
      haccpDeclarationAccepted: p.haccp_declaration_accepted || false,
      beekeeperRegistryNumber: p.beekeeper_registry_number || null,
      cpnpNotificationNumber: p.cpnp_notification_number || null,
      responsiblePersonName: p.responsible_person_name || null,
      website: p.website || null,
      foodLicenseNumber: p.food_license_number || null,
      iban: p.iban || null,
      bankAccountHolder: p.bank_account_holder || null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      // Stripe Connect (STRIPE-CONNECT-01)
      stripeConnectId: p.stripe_connect_id || null,
      stripeConnectStatus: p.stripe_connect_status || null,
      stripeChargesEnabled: p.stripe_charges_enabled || false,
      stripePayoutsEnabled: p.stripe_payouts_enabled || false,
    }))

    return NextResponse.json({ items, total: json.total || items.length })
  } catch (error) {
    console.error('[Admin] Producers proxy error:', error)
    return NextResponse.json({ error: 'Σφάλμα διακομιστή' }, { status: 500 })
  }
}
