import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db/client';

export async function GET(req: Request){
  const {searchParams} = new URL(req.url);
  const q = searchParams.get('q') || '';
  const region = searchParams.get('region') || '';
  const category = searchParams.get('category') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1',10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12',10)));
  const where:any = { isActive: true };
  if(q) where.OR = [{name:{contains:q}},{region:{contains:q}},{category:{contains:q}}];
  if(region) where.region = region;
  if(category) where.category = category;
  const total = await prisma.producer.count({where});
  const items = await prisma.producer.findMany({ where, orderBy: [{name:'asc'}], skip:(page-1)*pageSize, take:pageSize });
  return NextResponse.json({ total, pages: Math.max(1, Math.ceil(total/pageSize)), page, items });
}
