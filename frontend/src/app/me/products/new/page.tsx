import { requireProducer } from '@/lib/auth/producer';
import { prisma } from '@/lib/db/client';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { resolveProducerIdStrict } from '@/lib/auth/resolve-producer';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Νέο Προϊόν | Dixis' };

const ProductSchema = z.object({
  title: z.string().min(2, 'Τίτλος'),
  category: z.string().optional().default(''),
  price: z.coerce.number().min(0),
  unit: z.string().default('τεμ'),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  description: z.string().optional().default(''),
  imageUrl: z.string().url('URL εικόνας μη έγκυρο').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
});

async function createProduct(formData: FormData){
  "use server";
  await requireProducer();
  const data = Object.fromEntries(formData) as any;
  data.isActive = data.isActive === 'on' || data.isActive === 'true';

  const parsed = ProductSchema.safeParse(data);
  if(!parsed.success) throw new Error('invalid_input');

  const producerId = await resolveProducerIdStrict();
  if (!producerId) { throw new Error('no_producer_mapping'); }

  const payload = {
    ...parsed.data,
    producerId
  } as Prisma.ProductUncheckedCreateInput;

  await prisma.product.create({ data: payload });
  redirect('/me/products');
}

export default async function NewProductPage(){
  await requireProducer();
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Νέο Προϊόν</h1>
      
      <form action={createProduct} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Τίτλος *
          </label>
          <input 
            name="title" 
            placeholder="Τίτλος προϊόντος"
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
            placeholder="π.χ. Μέλι, Φρούτα"
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
              placeholder="0.00"
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
              placeholder="τεμ, kg, λτ"
              defaultValue="τεμ"
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
            placeholder="0"
            defaultValue={0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              name="isActive" 
              defaultChecked 
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
            placeholder="Προαιρετική περιγραφή"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Εικόνας
          </label>
          <input
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg (προαιρετικό)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
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
    </main>
  );
}
