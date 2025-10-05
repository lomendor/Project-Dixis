'use client';
import { useEffect, useState } from 'react';

type Prod = {
  id:string;
  title:string;
  category:string;
  price?:number;
  unit?:string;
  stock:number;
  imageUrl?:string;
  description?:string;
};

export const dynamic = 'force-dynamic';

export default function MyProducts(){
  const [items,setItems]=useState<Prod[]>([]);
  const [f,setF]=useState<Partial<Prod>>({ title:'', category:'', stock:0 });
  const [err,setErr]=useState<string|null>(null);

  async function load(){
    const r=await fetch('/api/me/products',{cache:'no-store'});
    const j=await r.json();
    setItems(j.items||[]);
  }

  useEffect(()=>{ load(); },[]);

  async function upload(file:File){
    const fd=new FormData();
    fd.append('file',file);
    const r=await fetch('/api/me/uploads',{method:'POST',body:fd,credentials:'include'});
    if(!r.ok) throw new Error('upload');
    const j=await r.json();
    return j.url as string;
  }

  async function create(e:any){
    e.preventDefault();
    setErr(null);
    const payload = {
      title:f.title,
      category:f.category,
      price:f.price,
      unit:f.unit,
      stock: Number(f.stock||0),
      description:f.description,
      imageUrl:f.imageUrl
    };
    const r=await fetch('/api/me/products',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const j=await r.json();
    if(!r.ok){ setErr(j?.error||'Σφάλμα'); return; }
    setF({ title:'', category:'', stock:0 });
    await load();
  }

  async function incStock(p:Prod){
    await fetch('/api/me/products/'+p.id,{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({stock:(p.stock||0)+1})
    });
    await load();
  }

  async function remove(id:string){
    if(!confirm('Διαγραφή;')) return;
    await fetch('/api/me/products/'+id,{method:'DELETE'});
    await load();
  }

  return (<main style={{padding:16}}>
    <h1>Τα προϊόντα μου</h1>
    <form onSubmit={create} style={{display:'grid',gap:12, maxWidth:640}}>
      <label>
        Τίτλος
        <input value={f.title||''} onChange={e=>setF({...f, title:e.target.value})} required/>
      </label>
      <label>
        Κατηγορία
        <input value={f.category||''} onChange={e=>setF({...f, category:e.target.value})} required/>
      </label>
      <label>
        Τιμή
        <input type="number" step="0.01" value={(f.price as any)||''} onChange={e=>setF({...f, price: Number(e.target.value)})}/>
      </label>
      <label>
        Μονάδα (π.χ. kg/lt/τεμ)
        <input value={f.unit||''} onChange={e=>setF({...f, unit:e.target.value})}/>
      </label>
      <label>
        Απόθεμα
        <input type="number" value={(f.stock as any)||0} onChange={e=>setF({...f, stock: Number(e.target.value)})}/>
      </label>
      <label>
        Περιγραφή
        <textarea value={f.description||''} onChange={e=>setF({...f, description:e.target.value})}/>
      </label>
      <label>
        Φωτογραφία
        <input type="file" accept="image/*" onChange={async e=>{
          const file=e.target.files?.[0];
          if(file){
            try{
              const url=await upload(file);
              setF({...f, imageUrl:url});
            }catch{
              setErr('Αποτυχία ανεβάσματος');
            }
          }
        }}/>
      </label>
      <button className="btn btn-primary" type="submit">Προσθήκη</button>
      {err && <p style={{color:'#b91c1c'}}>{err}</p>}
    </form>
    <hr style={{margin:'16px 0'}}/>
    <ul style={{
      listStyle:'none',
      padding:0,
      display:'grid',
      gap:12,
      gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'
    }}>
      {items.map(p=>(
        <li key={p.id} className="card" style={{padding:12}}>
          {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{width:'100%',height:140,objectFit:'cover',borderRadius:12}}/>}
          <strong>{p.title}</strong>
          <div style={{color:'#6b7280'}}>
            {p.category}
            {typeof p.price==='number' ? ` · ${p.price.toFixed(2)}${p.unit? ' / '+p.unit:''}`:''}
          </div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn" onClick={()=>incStock(p)}>+1 απόθεμα</button>
            <button className="btn" onClick={()=>remove(p.id)}>Διαγραφή</button>
          </div>
        </li>
      ))}
    </ul>
  </main>);
}
