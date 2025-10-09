export type ShippingMethod = 'PICKUP'|'COURIER'|'COURIER_COD';
export interface QuoteInput { method: ShippingMethod; subtotal: number; }
export interface Quote { cost: number; breakdown: { base:number; cod:number; remote:number; promo:number }; }

function n(v:string|undefined, d:number){ const x = Number(v); return Number.isFinite(x)?x:d; }
function f2(x:number){ return Number((x).toFixed(2)); }

export function quote({ method, subtotal }: QuoteInput): Quote {
  const enabled = (process.env.SHIPPING_ENABLED||'true')==='true';
  if(!enabled) return { cost: 0, breakdown:{ base:0, cod:0, remote:0, promo:0 } };

  const BASE = n(process.env.SHIPPING_BASE_EUR, 3.50);
  const CODF = n(process.env.SHIPPING_COD_FEE_EUR, 2.00);
  const REMOTE = n(process.env.SHIPPING_REMOTE_SURCHARGE_EUR, 0); // μελλοντικά για δυσπρόσιτα
  const FREE = n(process.env.SHIPPING_FREE_THRESHOLD_EUR, 0);     // 0 => ποτέ δωρεάν

  if (FREE>0 && subtotal>=FREE) return { cost: 0, breakdown:{ base:0, cod:0, remote:0, promo:0 } };

  const base = method==='PICKUP' ? 0 : BASE;
  const cod = method==='COURIER_COD' ? CODF : 0;
  const remote = 0 + REMOTE; // placeholder για περιοχή
  const promo = 0;

  const total = f2(base + cod + remote - promo);
  return { cost: total, breakdown:{ base:f2(base), cod:f2(cod), remote:f2(remote), promo:f2(promo) } };
}
