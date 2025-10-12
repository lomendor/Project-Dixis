// Lightweight observability helpers
export function getRequestId(headers: Headers){
  return headers.get('x-request-id') || crypto.randomUUID()
}
export function logWithId(rid: string, msg: string, details?: any){
  try { console.log(`[rid:${rid}] ${msg}`, details ?? '') } catch {}
}
