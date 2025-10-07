import { readCart, totals } from '@/lib/cart/cookie';
import { setQtyAction, removeAction } from './server-actions';

export default async function Page(){
  const cart = await readCart();
  const { subtotal } = totals(cart);

  return (
    <main>
      <h1>Καλάθι</h1>
      {cart.items.length===0 ? <p>Το καλάθι σας είναι άδειο.</p> : (
        <>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th>Προϊόν</th><th>Τιμή</th><th>Ποσότητα</th><th>Σύνολο</th><th></th></tr></thead>
            <tbody>
              {cart.items.map(it=>(
                <tr key={it.productId} style={{borderTop:'1px solid #eee'}}>
                  <td>{it.title}</td>
                  <td>{it.price} / {it.unit}</td>
                  <td>
                    <form action={setQtyAction} style={{display:'inline-flex', gap:6}}>
                      <input type="hidden" name="productId" value={it.productId}/>
                      <input type="number" name="qty" min="0" defaultValue={it.qty} style={{width:70}}/>
                      <button type="submit">Ενημέρωση</button>
                    </form>
                  </td>
                  <td>{(it.price*it.qty).toFixed(2)}</td>
                  <td>
                    <form action={removeAction}>
                      <input type="hidden" name="productId" value={it.productId}/>
                      <button type="submit">Αφαίρεση</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{display:'flex', justifyContent:'flex-end', gap:16, marginTop:12}}>
            <div><strong>Μερικό σύνολο:</strong> {subtotal.toFixed(2)}</div>
            <a href="/checkout" style={{padding:'8px 12px', border:'1px solid #111', borderRadius:8, textDecoration:'none'}}>Συνέχεια στο ταμείο</a>
          </div>
        </>
      )}
    </main>
  );
}
