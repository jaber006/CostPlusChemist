'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScheduleBadge } from '@/components/schedule-badge'
import { PriceBreakdown } from '@/components/price-breakdown'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const savings = product.rrp - product.ourPrice
  const savingsPercent = product.rrp > 0 ? ((savings / product.rrp) * 100) : 0

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200">
      <Link href={`/products/${product.category}/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 p-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="default" className="text-xs">
              15% margin
            </Badge>
            {savings > 0 && savingsPercent >= 5 && (
              <Badge variant="success" className="text-xs">
                Save {savingsPercent.toFixed(0)}%
              </Badge>
            )}
          </div>
          {product.schedule && (
            <div className="absolute top-2 right-2">
              <ScheduleBadge schedule={product.schedule} />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand}</p>
        <Link href={`/products/${product.category}/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <PriceBreakdown
          wholesalePrice={product.wholesalePrice}
          ourPrice={product.ourPrice}
          rrp={product.rrp}
          compact
        />

        <Button
          className="w-full mt-2"
          size="sm"
          onClick={() =>
            addItem({
              code: product.code,
              name: product.name,
              brand: product.brand,
              category: product.category,
              wholesalePrice: product.wholesalePrice,
              ourPrice: product.ourPrice,
              rrp: product.rrp,
              imageUrl: product.imageUrl,
              slug: product.slug,
            })
          }
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
}
