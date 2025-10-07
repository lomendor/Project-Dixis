import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/producer';
import { resolveProducerIdStrict } from '@/lib/auth/resolve-producer';
import { redirect, notFound } from 'next/navigation';
import { z } from 'zod';

export const dynamic = 'force-dynamic'; // Prevent static generation

const ProductSchema = z.object({
  title: z.string().min(2),
  category: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  unit: z.string().default('τεμ'),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  description: z.string().optional().default(''),
});

async function updateProduct(id:string, formData: FormData){
  "use server";
  await requireProducer();
  const data = Object.fromEntries(formData) as any;
  data.isActive = data.isActive === 'on' || data.isActive === 'true';
  
  const parsed = ProductSchema.safeParse(data);
  if(!parsed.success) throw new Error('invalid_input');
  
  await prisma.product.update({ where:{ id }, data: parsed.data });
  redirect('/me/products');
}

async function deactivate(id:string){
  "use server"; 
  await requireProducer();
  await prisma.product.update({ where:{ id }, data:{ isActive:false } });
  redirect('/me/products');
}

export default async function EditProductPage({ params }:{ params:{ id:string } }){
  await requireProducer();
  const producerId = await resolveProducerIdStrict();
  if (!producerId) return notFound();

  const p = await prisma.product.findFirst({ where:{ id: params.id, producerId } });

  if(!p) return notFound();
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Επεξεργασία: {p.title}</h1>
      
      <form action={async (fd)=>{ "use server"; await updateProduct(p.id, fd); }} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Τίτλος *
          </label>
          <input 
            name="title" 
            defaultValue={p.title}
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Κατηγορία
          </label>
          <input 
            name="category" 
            defaultValue={p.category||''}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Τιμή (€) *
            </label>
            <input 
              name="price" 
              type="number" 
              step="0.01" 
              defaultValue={Number(p.price||0)}
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Μονάδα
            </label>
            <input 
              name="unit" 
              defaultValue={p.unit||'τεμ'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Απόθεμα
          </label>
          <input 
            name="stock" 
            type="number" 
            step="1" 
            defaultValue={Number(p.stock||0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="isActive" 
              defaultChecked={!!p.isActive}
              className="w-4 h-4 text-green-600 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Ενεργό</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Περιγραφή
          </label>
          <textarea 
            name="description" 
            defaultValue={(p as any).description||''}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          ></textarea>
        </div>
        
        <div className="flex gap-4">
          <button 
            type="submit"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Αποθήκευση
          </button>
          <a 
            href="/me/products"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-center"
          >
            Ακύρωση
          </a>
        </div>
      </form>
      
      <form action={async ()=>{ "use server"; await deactivate(p.id); }} className="mt-4">
        <button 
          type="submit"
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Απενεργοποίηση Προϊόντος
        </button>
      </form>
    </main>
  );
}
