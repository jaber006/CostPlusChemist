'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/products'

export function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          className="px-3 py-2 hover:bg-gray-50 transition-colors"
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-3 py-2 font-medium min-w-[2.5rem] text-center">{quantity}</span>
        <button
          className="px-3 py-2 hover:bg-gray-50 transition-colors"
          onClick={() => setQuantity(q => q + 1)}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <Button
        size="lg"
        className="flex-1"
        onClick={handleAdd}
        disabled={product.stock <= 0 || added}
      >
        {added ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </>
        )}
      </Button>
    </div>
  )
}
