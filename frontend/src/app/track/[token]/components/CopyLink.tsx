'use client'
import { useState } from 'react'

export function CopyLink({ token }:{ token:string }){
  const [copied, setCopied] = useState(false)
  const url = (typeof window!=='undefined' ? `${window.location.origin}/track/${token}` : `/track/${token}`)

  async function onCopy(){
    try{
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url)
    }catch(_e){}
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  return (
    <div style={{marginTop:12}}>
      <button
        onClick={onCopy}
        aria-live="polite"
        style={{
          padding:'8px 12px',
          border:'1px solid #ccc',
          borderRadius:8,
          cursor:'pointer',
          backgroundColor: copied ? '#f0fdf4' : 'white',
          color: copied ? '#16a34a' : 'inherit'
        }}
      >
        {copied ? 'Αντιγράφηκε!' : 'Αντιγραφή συνδέσμου'}
      </button>
      <div style={{fontSize:12, color:'#555', marginTop:6}}>{url}</div>
    </div>
  )
}
