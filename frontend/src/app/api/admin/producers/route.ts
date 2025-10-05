import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireRole } from '@/lib/auth/session';

export const runtime = 'nodejs';

/**
 * GET /api/admin/producers
 * Admin-only: όλοι οι παραγωγοί
 */
export async function GET(){
  try{
    await requireRole(['admin']);
    const all = await prisma.producer.findMany({ orderBy:{ createdAt: 'desc' }});
    return NextResponse.json({ items: all, total: all.length });
  }catch(e:any){
    return NextResponse.json({error: e?.message || 'Unauthorized'},{status:403});
  }
}

/**
 * DELETE /api/admin/producers?id=xxx
 * Admin-only: διαγραφή παραγωγού
 */
export async function DELETE(req: Request){
  try{
    await requireRole(['admin']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if(!id) return NextResponse.json({error:'Missing id'},{status:400});
    await prisma.producer.delete({ where:{ id }});
    return NextResponse.json({ ok:true });
  }catch(e:any){
    return NextResponse.json({error: e?.message || 'Unauthorized'},{status:403});
  }
}