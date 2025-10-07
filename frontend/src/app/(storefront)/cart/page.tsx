'use client';
import { useCart } from '@/lib/cart/context';

export default function Page(){
  const { getCart, setQty, removeItem, clear } = useCart();
  const s = getCart();
  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);
  const total = s.items.reduce((sum,i)=> sum + Number(i.price||0)*Number(i.qty||0), 0);

  return (
    <main style={{display:'grid',gap:12,padding:16}}>
      <h1>Καλάθι</h1>
      {s.items.length===0 && <p>Το καλάθι είναι άδειο.</p>}
      {s.items.length>0 && (
        <>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th>Προϊόν</th><th>Ποσότητα</th><th>Σύνολο</th><th/></tr></thead>
            <tbody>
              {s.items.map(i=>(
                <tr key={i.productId} style={{borderTop:'1px solid #eee'}}>
                  <td>{i.title}</td>
                  <td><input type="number" min={1} defaultValue={i.qty} onChange={e=>{ setQty(i.productId, parseInt(e.target.value||'1')); location.reload(); }} style={{width:70}}/></td>
                  <td>{fmt(Number(i.price||0)*Number(i.qty||0))}</td>
                  <td><button onClick={()=>{ removeItem(i.productId); location.reload(); }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div><b>Σύνολο:</b> {fmt(total)}</div>
          <div style={{display:'flex',gap:8}}>
            <a href="/checkout" style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:6}}>Συνέχεια στο Checkout</a>
            <button onClick={()=>{ clear(); location.reload(); }}>Καθαρισμός</button>
          </div>
        </>
      )}
    </main>
  );
}
