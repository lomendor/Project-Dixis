'use client';
import { useEffect, useState } from 'react';
let pushFn:(m:string)=>void=()=>{};
export function toast(msg:string){ pushFn(msg); }
export default function ToastHost(){
  const [q,setQ]=useState<string[]>([]);
  useEffect(()=>{ pushFn=(m)=>{ setQ(v=>[...v,m]); setTimeout(()=>setQ(v=>v.slice(1)), 2200); }; },[]);
  return <div style={{position:'fixed',right:16,bottom:16,zIndex:60}}>
    {q.map((m,i)=><div key={i} style={{marginTop:8,background:'#111',color:'#fff',padding:'8px 12px',borderRadius:8,opacity:.95}}>{m}</div>)}
  </div>;
}
