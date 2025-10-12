import React from 'react'
import Link from 'next/link'

function FIcon({dir}:{dir:'asc'|'desc'}){
  return <span aria-hidden>{dir==='asc' ? '↑' : '↓'}</span>
}

async function fetchProducers(q:string, active:string, sort:string){
  const params = new URLSearchParams()
  if(q) params.set('q', q)
  if(active) params.set('active', active)
  if(sort) params.set('sort', sort)

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001'
  const res = await fetch(`${url}/api/admin/producers?${params.toString()}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }
  })

  if(!res.ok) throw new Error('Failed to load producers')
  return res.json()
}

export default async function Page({ searchParams }: {
  searchParams: Promise<{ q?:string; active?:string; sort?:string }>
}){
  const params = await searchParams
  const q = params?.q || ''
  const active = params?.active || ''
  const sort = params?.sort || 'name-asc'

  const data = await fetchProducers(q, active, sort)
  const list = data?.items || data || []

  return (
    <main style={{padding:'16px', maxWidth:960, margin:'0 auto'}}>
      <h1>Παραγωγοί</h1>

      <form action="/admin/producers" method="get" style={{
        display:'grid',
        gridTemplateColumns:'1fr 160px 160px',
        gap:8,
        marginBottom:16
      }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Αναζήτηση ονόματος…"
          style={{padding:'8px'}}
        />
        <select name="active" defaultValue={active} style={{padding:'8px'}}>
          <option value="">Όλοι</option>
          <option value="only">Μόνο ενεργοί</option>
        </select>
        <select name="sort" defaultValue={sort} style={{padding:'8px'}}>
          <option value="name-asc">Όνομα ↑</option>
          <option value="name-desc">Όνομα ↓</option>
        </select>
        <button
          type="submit"
          style={{
            gridColumn:'1 / -1',
            padding:'8px',
            cursor:'pointer',
            backgroundColor:'#0070f3',
            color:'white',
            border:'none',
            borderRadius:'4px'
          }}
        >
          Εφαρμογή
        </button>
      </form>

      <table width="100%" cellPadding={8} style={{borderCollapse:'collapse'}}>
        <thead>
          <tr style={{textAlign:'left', borderBottom:'2px solid #ddd', backgroundColor:'#f5f5f5'}}>
            <th>
              Όνομα {sort.startsWith('name-') && <FIcon dir={sort.endsWith('asc')?'asc':'desc'} />}
            </th>
            <th>Περιοχή</th>
            <th>Κατηγορία</th>
            <th>Ενεργός</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p:any)=>(
            <tr key={p.id} style={{borderBottom:'1px solid #f0f0f0'}}>
              <td>{p.name||'—'}</td>
              <td>{p.region||'—'}</td>
              <td>{p.category||'—'}</td>
              <td style={{color: p.isActive ? 'green' : '#999'}}>
                {p.isActive ? 'Ναι' : 'Όχι'}
              </td>
            </tr>
          ))}
          {list.length===0 && (
            <tr>
              <td colSpan={4} style={{opacity:0.7, textAlign:'center', padding:16}}>
                Δεν βρέθηκαν αποτελέσματα.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{marginTop:16}}>
        <Link href="/admin" style={{color:'#0070f3', textDecoration:'none'}}>
          ← Επιστροφή στο Admin
        </Link>
      </div>
    </main>
  )
}
