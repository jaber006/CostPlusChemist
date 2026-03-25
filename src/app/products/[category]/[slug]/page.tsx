import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getProductBySlug, getCategories, getProductsByCategory } from '@/lib/products'
import { categoryLabel } from '@/lib/utils'
import { PriceBreakdown } from '@/components/price-breakdown'
import { ScheduleBadge } from '@/components/schedule-badge'
import { ProductDetailClient } from './product-detail-client'

interface ProductPageProps {
  params: { category: string; slug: string }
}

export function generateStaticParams() {
  const categories = getCategories()
  const params: { category: string; slug: string }[] = []
  for (const category of categories) {
    const products = getProductsByCategory(category)
    for (const product of products) {
      params.push({ category, slug: product.slug })
    }
  }
  return params
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = getProductBySlug(params.category, params.slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} - CostPlus Chemist`,
    description: `Buy ${product.name} for $${product.ourPrice.toFixed(2)}. Wholesale cost: $${product.wholesalePrice.toFixed(2)} + 15% margin. Save vs RRP of $${product.rrp.toFixed(2)}.`,
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.category, params.slug)
  if (!product) notFound()

  const label = categoryLabel(params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/products/${params.category}`} className="hover:text-primary transition-colors">
          {label}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product image */}
        <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-full max-h-96 object-contain"
          />
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">
              {product.brand}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <ScheduleBadge schedule={product.schedule} />
              <span className="text-sm text-gray-400">SKU: {product.code}</span>
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <PriceBreakdown
            wholesalePrice={product.wholesalePrice}
            ourPrice={product.ourPrice}
            rrp={product.rrp}
          />

          {/* Add to cart */}
          <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />

          {/* Shipping info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Shipping</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Standard delivery: $9.95</li>
              <li>Free shipping on orders over $99</li>
              <li>Ships from Legana, Tasmania</li>
            </ul>
          </div>

          {/* Category link */}
          <div className="text-sm">
            <span className="text-gray-500">Category: </span>
            <Link href={`/products/${product.category}`} className="text-primary hover:underline">
              {label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
