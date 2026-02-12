import React from 'react';
import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <main className="p-4">
      <div className="flex gap-3 mb-4">
        <Skeleton style={{width:120, height:28}} />
        <Skeleton style={{width:120, height:28}} />
        <Skeleton style={{width:90, height:28}} />
      </div>
      <div>
        {Array.from({length:6}).map((_,i)=>(
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center mb-3.5">
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
