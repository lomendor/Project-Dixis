import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/producer';
import Link from 'next/link';

export const metadata = { title: 'Τα Προϊόντα μου | Dixis' };
export const dynamic = 'force-dynamic'; // Prevent static generation

export default async function MyProductsPage({ searchParams }:{ searchParams?:{ q?:string, active?:string } }){
  const user = await requireProducer();
  const q = (searchParams?.q||'').trim();
  const active = (searchParams?.active||'').toLowerCase();
  const where:any = {};

  // Best-effort: Filter by producerId if available
  try {
    const producerId = user?.id || user?.phone || 'unknown';
    where.producerId = producerId;
  } catch {
    // Fallback: show all products (dev scenario)
    console.warn('[me/products] producerId filtering not available');
  }

  if(q) where.OR = [{ title: { contains: q } }, { category: { contains: q } }];
  if(active==='true') where.isActive = true;
  if(active==='false') where.isActive = false;

  const items = await prisma.product.findMany({
    where, orderBy:{ updatedAt: 'desc' },
    select:{ id:true, title:true, category:true, price:true, unit:true, stock:true, isActive:true }
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Τα Προϊόντα μου</h1>
      
      <div className="flex gap-4 mb-6">
        <form className="flex gap-2 flex-1">
          <input 
            name="q" 
            placeholder="Αναζήτηση (τίτλος/κατηγορία)" 
            defaultValue={q}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select 
            name="active" 
            defaultValue={active}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Όλα</option>
            <option value="true">Ενεργά</option>
            <option value="false">Μη ενεργά</option>
          </select>
          <button 
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Φίλτρα
          </button>
        </form>
        <Link 
          href="/me/products/new"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Νέο Προϊόν
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Τίτλος</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Κατηγορία</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Τιμή</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Απόθεμα</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Κατάσταση</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(p=>(
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{p.title}</td>
                <td className="px-6 py-4">{p.category||'-'}</td>
                <td className="px-6 py-4">
                  {new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(Number(p.price||0))}/{p.unit||'τεμ'}
                </td>
                <td className="px-6 py-4">{p.stock??'-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.isActive ? 'Ενεργό' : 'Μη ενεργό'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/me/products/${p.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Επεξεργασία
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length===0 && (
          <p className="text-center py-8 text-gray-500">Δεν βρέθηκαν προϊόντα.</p>
        )}
      </div>
    </main>
  );
}
