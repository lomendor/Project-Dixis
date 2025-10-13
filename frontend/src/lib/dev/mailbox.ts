export type DevMail = { to:string; subject:string; text?:string; html?:string; date:string };
const MAX = 100;
const box: DevMail[] = [];
export function put(m: DevMail){ box.unshift(m); if (box.length>MAX) box.pop(); }
export function list(to?: string){
  if (!to) return box.slice(0,25);
  const t = to.toLowerCase();
  return box.filter(m => m.to.toLowerCase()===t).slice(0,25);
}
export function first(to: string){ return list(to)[0] || null; }
