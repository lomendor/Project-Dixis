import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic' // for router state / searchParams

export default function Page(){
  return (
    <Suspense fallback={<div style={{padding:16}}>Φόρτωση…</div>}>
      <CheckoutClient />
    </Suspense>
  )
}
