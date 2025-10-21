import React from 'react';
import Skeleton from '@/components/Skeleton';

export default function Loading() {
  // Simple grid skeleton for filters + list
  return (
    <main style={{padding:16}}>
      <div style={{display:'flex', gap:12, marginBottom:16}}>
        <Skeleton style={{width:120, height:28}} />
        <Skeleton style={{width:120, height:28}} />
        <Skeleton style={{width:90, height:28}} />
      </div>
      <div>
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:12, alignItems:'center', marginBottom:14}}>
            <Skeleton style={{height:18}} />
            <Skeleton style={{height:18}} />
            <Skeleton style={{height:18}} />
            <Skeleton style={{height:18}} />
          </div>
        ))}
      </div>
    </main>
  );
}
