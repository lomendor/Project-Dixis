import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import AddToCartButton from './AddToCartButton';

// Make this page dynamic to avoid build-time database queries
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      price: true,
      unit: true,
      stock: true,
      imageUrl: true,
      isActive: true,
      producer: {
        select: {
          id: true,
          name: true,
          region: true
        }
      }
    }
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const stock = Number(product.stock || 0);
  const isAvailable = stock > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-96 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 md:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">Χωρίς εικόνα</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <span className="text-sm text-gray-500 uppercase">{product.category}</span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.title}</h1>
              </div>

              {product.description && (
                <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
              )}

              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  €{Number(product.price).toFixed(2)}
                  {product.unit && (
                    <span className="text-lg text-gray-600 font-normal ml-2">
                      ανά {product.unit}
                    </span>
                  )}
                </p>
              </div>

              {/* Stock status */}
              <div className="mb-6">
                {!isAvailable ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-semibold">Εξαντλημένο</span>
                  </div>
                ) : stock <= 5 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-orange-600 font-semibold">
                      Μόνο {stock} διαθέσιμα
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 font-semibold">Διαθέσιμο</span>
                  </div>
                )}
              </div>

              {/* Add to cart */}
              <AddToCartButton
                product={{
                  productId: product.id,
                  title: product.title,
                  price: Number(product.price),
                  unit: product.unit || undefined,
                  stock: stock
                }}
                disabled={!isAvailable}
              />

              {/* Producer info */}
              {product.producer && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm text-gray-500 uppercase mb-2">Παραγωγός</h3>
                  <p className="text-lg font-semibold">{product.producer.name}</p>
                  {product.producer.region && (
                    <p className="text-gray-600">{product.producer.region}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
