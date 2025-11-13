import { prisma } from '@/lib/db/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Add from './ui/Add';
import BuyBox from '@/components/cart/BuyBox';

export const dynamic = 'force-dynamic';

export default async function Page({ params }:{ params: Promise<{ id:string }> }){
  const t = await getTranslations();
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where:{ id: String(id||'') },
    select:{
      id:true,
      title:true,
      price:true,
      unit:true,
      stock:true,
      isActive:true,
      description:true,
      category:true,
      imageUrl:true
    }
  });

  if(!p || !p.isActive) return notFound();

  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              {t('nav.home')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/products" className="text-blue-600 hover:underline">
              {t('products.title')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600">{p.title}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.title}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2" data-testid="product-title">
            {p.title}
          </h1>

          {p.category && (
            <p className="text-gray-600 mb-4">{p.category}</p>
          )}

          {/* Price */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">
              {t('product.price')}
            </span>
            <span className="text-3xl font-bold" data-testid="product-price">
              {fmt(Number(p.price||0))} / {p.unit}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6" data-testid="product-stock">
            <span className="text-sm text-gray-600 block mb-1">
              {t('product.stock')}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                Number(p.stock||0) > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {Number(p.stock||0) > 0 ? t('product.inStock') : t('product.outOfStock')} ({Number(p.stock||0)})
            </span>
          </div>

          {/* Description */}
          {p.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t('product.description')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {p.description}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-auto">
            <Add product={p}/>
          </div>
          <BuyBox product={{ id: p!.id as any, title: p!.title ?? p!.title, price: p!.price, currency: 'EUR' }} />
        </div>
      </div>

      {/* Back to Products */}
      <div className="mt-8">
        <Link
          href="/products"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('product.backToProducts')}
        </Link>
      </div>
    </main>
  );
}
