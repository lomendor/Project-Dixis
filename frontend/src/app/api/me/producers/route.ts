import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from '@/lib/auth/session';
import { z } from 'zod';
import { slugify } from '@/lib/utils/slug';

const Create = z.object({
  name: z.string().min(2),
  region: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  phone: z.string().optional(), // public phone for profile (optional)
  email: z.string().email().optional()
});
const Update = Create.partial();

export async function GET(){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  return NextResponse.json({ item: me || null });
}

export async function POST(req: Request){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const exists = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(exists) return NextResponse.json({error:'Έχετε ήδη προφίλ παραγωγού.'},{status:400});
  const body = await req.json().catch(():null=>null);
  const parsed = Create.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'Λάθος στοιχεία', details: parsed.error},{status:400});
  const data = parsed.data;
  const baseSlug = slugify(data.name);
  let slug = baseSlug || 'producer';
  // ensure unique slug
  for(let i=0;i<10;i++){
    const hit = await prisma.producer.findUnique({ where:{ slug } }).catch(():null=>null);
    if(!hit) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2,6)}`;
  }
  const created = await prisma.producer.create({
    data:{
      slug,
      name: data.name,
      region: data.region,
      category: data.category,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      phone: data.phone || null,
      email: data.email || null,
      products: 0,
      rating: 0,
      isActive: true,
      ownerPhone: phone
    }
  });
  // Αυτόματη αναβάθμιση σε producer role
  const { cookies } = await import('next/headers');
  const c = await cookies();
  const sessId = c.get('dixis_session')?.value;
  if(sessId){
    await prisma.session.update({ where:{ id: sessId }, data:{ role: 'producer' }}).catch(():null=>null);
  }
  return NextResponse.json({ item: created }, {status:201});
}

export async function PATCH(req: Request){
  const phone = await getSessionPhone();
  if(!phone) return NextResponse.json({error:'Auth required'},{status:401});
  const me = await prisma.producer.findFirst({ where:{ ownerPhone: phone }});
  if(!me) return NextResponse.json({error:'Δεν υπάρχει προφίλ. Δημιουργήστε πρώτα.'},{status:400});
  const body = await req.json().catch(():null=>null);
  const parsed = Update.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:'Λάθος στοιχεία', details: parsed.error},{status:400});
  const data:any = parsed.data;
  const updated = await prisma.producer.update({ where:{ id: me.id }, data });
  return NextResponse.json({ item: updated });
}
