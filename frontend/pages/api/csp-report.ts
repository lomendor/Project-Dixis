import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const body = req.body || {}
    // Μικρό, ασφαλές log (χωρίς ευαίσθητα δεδομένα)
    console.log('[CSP-REPORT]', JSON.stringify(body).slice(0, 2000))
  } catch {}
  return res.status(204).end()
}