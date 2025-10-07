'use client';
export type CartItem={ productId:string; title:string; price:number; qty:number };
type State={ items:CartItem[] };
const KEY='dixis_cart_v1';
function load():State{ try{ return JSON.parse(localStorage.getItem(KEY)||'{"items":[]}'); }catch{ return {items:[]} } }
function save(s:State){ localStorage.setItem(KEY, JSON.stringify(s)); }
export function getCart():State{ if(typeof window==='undefined') return {items:[]}; return load(); }
export function addItem(i:CartItem){ const s=load(); const idx=s.items.findIndex(x=>x.productId===i.productId); if(idx>=0){ s.items[idx].qty+=i.qty; }else{ s.items.push(i); } save(s); return s; }
export function setQty(id:string, qty:number){ const s=load(); const it=s.items.find(x=>x.productId===id); if(it){ it.qty=Math.max(1,qty); save(s);} return s; }
export function removeItem(id:string){ const s=load(); s.items=s.items.filter(x=>x.productId!==id); save(s); return s; }
export function clear(){ save({items:[]}); }
