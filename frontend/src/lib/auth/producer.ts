type SessionUser = { id?: string; phone?: string; role?: string };

async function currentUser(): Promise<SessionUser | null> {
  try {
    const mod: any = await import('@/lib/auth/session');
    if (typeof mod.currentUser === 'function') return await mod.currentUser();
    if (typeof mod.requireSessionUser === 'function') return await mod.requireSessionUser();
    if (typeof mod.getSessionPhone === 'function') {
      const phone = await mod.getSessionPhone();
      return phone ? { phone, id: phone } : null;
    }
  } catch {}
  return null;
}

function envPhones(){ 
  return (process.env.PRODUCER_PHONES||'').split(',').map(s=>s.trim()).filter(Boolean); 
}

function isProducer(u: SessionUser|null, allow:string[]){ 
  if(!u) return false; 
  return (u.role||'').toUpperCase()==='PRODUCER' || (!!u.phone && allow.includes(u.phone)); 
}

export async function requireProducer(): Promise<SessionUser|null>{
  const u = await currentUser(); 
  const allow = envPhones();
  
  if(allow.length===0){ 
    if(process.env.NODE_ENV!=='production') {
      console.warn('[producer] PRODUCER_PHONES not set — permissive mode (dev/CI)');
    }
    return u; 
  }
  
  if(!isProducer(u, allow)) {
    throw new Error('forbidden_producer');
  }
  
  return u;
}
