export type Line = { price:number; qty:number };

export function envNum(name:string, def:number){
  const v = Number(process.env[name]);
  return Number.isFinite(v) ? v : def;
}

export function calc(lines: Line[]){
  const VAT = envNum('VAT_RATE', 0.13);
  const SHIP_FLAT = envNum('SHIPPING_FLAT_EUR', 3.5);
  const SHIP_FREE = envNum('SHIPPING_FREE_FROM_EUR', 25);

  const subtotal = lines.reduce((s,l)=> s + Number(l.price||0)*Number(l.qty||0), 0);
  const vat = +(subtotal * VAT).toFixed(2);
  const shipping = subtotal >= SHIP_FREE ? 0 : SHIP_FLAT;
  const total = +(subtotal + vat + shipping).toFixed(2);
  return { subtotal:+subtotal.toFixed(2), vat, shipping, total, rate:VAT };
}

export const fmt = (n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);
