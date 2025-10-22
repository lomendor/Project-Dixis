'use client';
import React from 'react';

type Opt = { key: string; label: string };
export default function FilterChips({
  options,
  active,
  onChange,
}: {
  options: Opt[];
  active: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
      <button
        type="button"
        data-testid="chip-all"
        aria-pressed={active===null}
        onClick={() => onChange(null)}
        style={{
          padding:'6px 10px', borderRadius:999, border:'1px solid #ddd',
          background: active===null ? '#111' : '#fff',
          color: active===null ? '#fff' : '#333', fontSize:12, fontWeight:600,
          cursor:'pointer'
        }}
      >Όλες</button>
      {options.map(o=>{
        const is = active===o.key;
        return (
          <button
            key={o.key}
            type="button"
            data-testid={`chip-${o.key}`}
            aria-pressed={is}
            onClick={() => onChange(is ? null : o.key)}
            style={{
              padding:'6px 10px', borderRadius:999, border:'1px solid #ddd',
              background: is ? '#111' : '#fff',
              color: is ? '#fff' : '#333', fontSize:12, fontWeight:600,
              cursor:'pointer'
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}
