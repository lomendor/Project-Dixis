import { redirect } from 'next/navigation'

export default function Page({ params }:{ params:{ token:string } }){
  redirect(`/track/${params.token}`)
}

export const metadata = { robots: { index:false, follow:false } }
