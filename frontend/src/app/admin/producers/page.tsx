'use client';
import * as React from 'react'

interface Producer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  region: string
  category: string
  isActive: boolean
}

function Row({p, onToggle}:{p:Producer; onToggle:(id:string)=>void}){
  return (
    <tr>
      <td style={{padding:'8px'}}>{p.name}</td>
      <td style={{padding:'8px'}}>{p.region}</td>
      <td style={{padding:'8px'}}>{p.category}</td>
      <td style={{padding:'8px'}}>{p.email||'—'}</td>
      <td style={{padding:'8px'}}>{p.phone||'—'}</td>
      <td style={{padding:'8px'}}>
        <span style={{color: p.isActive?'green':'#999'}}>
          {p.isActive?'Ενεργός':'Ανενεργός'}
        </span>
      </td>
      <td style={{padding:'8px'}}>
        <button onClick={()=>onToggle(p.id)} style={{cursor:'pointer'}}>
          toggle
        </button>
      </td>
    </tr>
  )
}

export default function ProducersPage(){
  const [items,setItems]=React.useState<Producer[]>([])
  const [form,setForm]=React.useState({
    name:'',
    slug:'',
    region:'',
    category:'',
    email:'',
    phone:''
  })

  const load=async()=>{
    const r=await fetch('/api/admin/producers')
    const j=await r.json()
    setItems(j.items||[])
  }

  React.useEffect(()=>{ load() },[])

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    await fetch('/api/admin/producers',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify(form)
    })
    setForm({name:'',slug:'',region:'',category:'',email:'',phone:''})
    load()
  }

  const toggle=async(id:string)=>{
    await fetch(`/api/admin/producers/${id}`,{
      method:'PATCH',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({toggleActive:true})
    })
    load()
  }

  return (
    <main style={{padding:16}}>
      <h1>Παραγωγοί</h1>

      <form onSubmit={submit} style={{display:'flex', gap:8, margin:'12px 0', flexWrap:'wrap'}}>
        <input
          placeholder="Όνομα"
          value={form.name}
          onChange={e=>setForm({...form, name:e.target.value})}
          required
          style={{padding:'4px 8px'}}
        />
        <input
          placeholder="Slug"
          value={form.slug}
          onChange={e=>setForm({...form, slug:e.target.value})}
          required
          style={{padding:'4px 8px'}}
        />
        <input
          placeholder="Περιοχή"
          value={form.region}
          onChange={e=>setForm({...form, region:e.target.value})}
          required
          style={{padding:'4px 8px'}}
        />
        <input
          placeholder="Κατηγορία"
          value={form.category}
          onChange={e=>setForm({...form, category:e.target.value})}
          required
          style={{padding:'4px 8px'}}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e=>setForm({...form, email:e.target.value})}
          style={{padding:'4px 8px'}}
        />
        <input
          placeholder="Τηλέφωνο"
          value={form.phone}
          onChange={e=>setForm({...form, phone:e.target.value})}
          style={{padding:'4px 8px'}}
        />
        <button type="submit" style={{padding:'4px 12px', cursor:'pointer'}}>
          Προσθήκη
        </button>
      </form>

      <table style={{borderCollapse:'collapse', width:'100%', marginTop:'20px'}}>
        <thead>
          <tr style={{backgroundColor:'#f5f5f5'}}>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Όνομα</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Περιοχή</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Κατηγορία</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Email</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Τηλ</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Κατάσταση</th>
            <th style={{padding:'8px', textAlign:'left', borderBottom:'2px solid #ddd'}}>Ενέργεια</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p=>(
            <Row key={p.id} p={p} onToggle={toggle}/>
          ))}
        </tbody>
      </table>
    </main>
  )
}
