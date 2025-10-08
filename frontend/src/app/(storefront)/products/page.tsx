export const dynamic = 'force-dynamic';
import { searchProducts } from '@/lib/search/products';
import Link from 'next/link';

function num(v?:string){ const n = Number(v); return Number.isFinite(n)? n: undefined; }

export default async function Page({ searchParams }:{ searchParams?:Record<string,string|undefined> }){
  const f = {
    q: searchParams?.q || '',
    category: searchParams?.category || '',
    min: num(searchParams?.min),
    max: num(searchParams?.max),
    inStockOnly: String(searchParams?.stock||'')==='in',
    sort: (['new','price-asc','price-desc'].includes(String(searchParams?.sort)) ? searchParams?.sort : 'new') as any,
    page: Number(searchParams?.page||1),
    pageSize: Number(searchParams?.pageSize||12),
  };
  const { items, total, page, pages } = await searchProducts(f);

  const params = new URLSearchParams();
  if(f.q) params.set('q', f.q as string);
  if(f.category) params.set('category', f.category as string);
  if(f.min!=null) params.set('min', String(f.min));
  if(f.max!=null) params.set('max', String(f.max));
  if(f.inStockOnly) params.set('stock', 'in');
  if(f.sort) params.set('sort', f.sort as string);

  const link = (patch:Record<string,string>)=>{
    const p = new URLSearchParams(params as any);
    Object.entries(patch).forEach(([k,v])=> v? p.set(k,String(v)) : p.delete(k));
    const str = p.toString();
    return str ? '?' + str : '?';
  };

  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main style={{display:'grid', gap:16, padding:16, maxWidth:1200, margin:'0 auto'}}>
      <h1>Προϊόντα</h1>

      <form method="get" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8, padding:16, border:'1px solid #eee', borderRadius:8}}>
        <input name="q" placeholder="Αναζήτηση τίτλου…" defaultValue={f.q||''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <input name="category" placeholder="Κατηγορία (π.χ. Ελιές)" defaultValue={f.category||''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <input type="number" step="0.01" name="min" placeholder="€ ελάχιστο" defaultValue={f.min ?? ''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <input type="number" step="0.01" name="max" placeholder="€ μέγιστο" defaultValue={f.max ?? ''} style={{padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <select name="sort" defaultValue={f.sort||'new'} style={{padding:8, border:'1px solid #ddd', borderRadius:4}}>
          <option value="new">Νεότερα</option>
          <option value="price-asc">Τιμή ↑</option>
          <option value="price-desc">Τιμή ↓</option>
        </select>
        <label style={{display:'flex',gap:6,alignItems:'center', padding:8}}>
          <input type="checkbox" name="stock" value="in" defaultChecked={f.inStockOnly}/> Μόνο διαθέσιμα
        </label>
        <button type="submit" style={{padding:'8px 16px', background:'#007bff', color:'white', border:'none', borderRadius:4, cursor:'pointer', fontWeight:600}}>
          Φίλτρο
        </button>
      </form>

      <div style={{opacity:.7}}>Σύνολο: {total} προϊόντα</div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        {items.map(p=>(
          <div key={p.id} style={{border:'1px solid #eee',borderRadius:8,padding:12, display:'flex', flexDirection:'column'}}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{width:'100%',height:140,objectFit:'cover',borderRadius:6}}/>}
            <div style={{fontWeight:600, marginTop:8, fontSize:14}}>{p.title}</div>
            <div style={{opacity:.7, fontSize:12}}>{p.category||'—'}</div>
            <div style={{fontSize:18, fontWeight:800, marginTop:4, color:'#007bff'}}>{fmt(Number(p.price||0))}</div>
            <div style={{fontSize:12, opacity:.7, marginTop:4}}>
              {Number(p.stock||0)>0
                ? <span style={{color:'#28a745'}}>✓ Σε απόθεμα ({Number(p.stock||0)} {p.unit})</span>
                : <span style={{color:'#dc3545'}}>Εξαντλημένο</span>
              }
            </div>
            <Link href={'/products/' + p.id} style={{marginTop:'auto', paddingTop:8, color:'#007bff', textDecoration:'none', fontSize:13}}>
              Λεπτομέρειες →
            </Link>
          </div>
        ))}
        {!items.length && (
          <div style={{opacity:.6, padding:24, textAlign:'center', gridColumn:'1/-1'}}>
            — Δεν βρέθηκαν προϊόντα —
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center', padding:16}}>
          <Link
            href={link({ page:String(Math.max(1,(page||1)-1)) })}
            aria-disabled={(page||1)<=1}
            style={{
              opacity:(page||1)<=1?.5:1,
              pointerEvents:(page||1)<=1?'none':'auto',
              padding:'6px 12px',
              border:'1px solid #ddd',
              borderRadius:4,
              textDecoration:'none',
              color:'#007bff'
            }}
          >
            « Προηγούμενη
          </Link>
          <span style={{padding:'6px 12px'}}>Σελίδα {page} από {pages}</span>
          <Link
            href={link({ page:String(Math.min(pages,(page||1)+1)) })}
            aria-disabled={(page||1)>=pages}
            style={{
              opacity:(page||1)>=pages?.5:1,
              pointerEvents:(page||1)>=pages?'none':'auto',
              padding:'6px 12px',
              border:'1px solid #ddd',
              borderRadius:4,
              textDecoration:'none',
              color:'#007bff'
            }}
          >
            Επόμενη »
          </Link>
        </nav>
      )}
    </main>
  );
}
