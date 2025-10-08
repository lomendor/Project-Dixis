export const dynamic = 'force-dynamic';
import { getCart, setQty, removeItem, total } from '@/lib/cart/cookie';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

export default function Page(){
  const cart = getCart();

  async function updateQty(formData: FormData){
    'use server';
    const productId = String(formData.get('productId')||'');
    const qty = Number(formData.get('qty')||0);
    setQty(productId, qty);
    redirect('/cart');
  }

  async function remove(formData: FormData){
    'use server';
    const productId = String(formData.get('productId')||'');
    removeItem(productId);
    redirect('/cart');
  }

  const cartTotal = total(cart);
  const isEmpty = cart.items.length === 0;

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:800,margin:'0 auto'}}>
      <h1>Καλάθι Αγορών</h1>

      {isEmpty ? (
        <div style={{display:'grid',gap:12,padding:24,textAlign:'center',border:'1px solid #eee',borderRadius:8}}>
          <p style={{opacity:.7}}>Το καλάθι σας είναι άδειο</p>
          <Link href="/products" style={{textDecoration:'none',color:'#0070f3'}}>
            Συνέχεια Αγορών
          </Link>
        </div>
      ) : (
        <>
          <div style={{display:'grid',gap:12}}>
            {cart.items.map(item => (
              <div key={item.productId} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:12,alignItems:'center',padding:12,border:'1px solid #eee',borderRadius:8}}>
                <div>
                  <div style={{fontWeight:'bold'}}>{item.title}</div>
                  <div style={{opacity:.7,fontSize:14}}>{fmt(Number(item.price||0))} × {item.qty}</div>
                </div>

                <form action={updateQty} style={{display:'flex',gap:4,alignItems:'center'}}>
                  <input type="hidden" name="productId" value={item.productId}/>
                  <input
                    type="number"
                    name="qty"
                    min="0"
                    max="99"
                    defaultValue={item.qty}
                    style={{width:70,padding:'4px 6px',border:'1px solid #ddd',borderRadius:4}}
                  />
                  <button type="submit" style={{padding:'4px 8px',border:'1px solid #ddd',borderRadius:4,fontSize:12}}>
                    ✓
                  </button>
                </form>

                <form action={remove}>
                  <input type="hidden" name="productId" value={item.productId}/>
                  <button type="submit" style={{padding:'6px 10px',border:'1px solid #f44',color:'#f44',borderRadius:4,fontSize:14,background:'white'}}>
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gap:12,padding:16,border:'2px solid #0070f3',borderRadius:8,backgroundColor:'#f8f9fa'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:20,fontWeight:'bold'}}>
              <span>Σύνολο:</span>
              <span>{fmt(cartTotal)}</span>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <Link href="/products" style={{padding:'12px 24px',border:'1px solid #ddd',borderRadius:6,textAlign:'center',textDecoration:'none',color:'#333'}}>
                Συνέχεια Αγορών
              </Link>
              <Link href="/checkout" style={{padding:'12px 24px',backgroundColor:'#0070f3',color:'white',borderRadius:6,textAlign:'center',textDecoration:'none',fontWeight:'bold'}}>
                Συνέχεια στο Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
