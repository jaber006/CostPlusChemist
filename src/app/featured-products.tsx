'use client'

import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/products'

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => (
        <ProductCard key={product.code} product={product} />
      ))}
    </div>
  )
}
