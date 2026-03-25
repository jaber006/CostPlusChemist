'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CartClient() {
  const { items, removeItem, updateQuantity, subtotal, postage, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse our products to find great deals with transparent pricing.</p>
        <Link href="/products">
          <Button size="lg">
            Browse Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart</h1>
      <p className="text-gray-600 mb-8">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const margin = item.ourPrice - item.wholesalePrice
            const lineTotal = item.ourPrice * item.quantity
            const lineSavings = (item.rrp - item.ourPrice) * item.quantity

            return (
              <div key={item.code} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link href={`/products/${item.category}/${item.slug}`} className="flex-shrink-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="96px"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{item.brand}</p>
                    <Link href={`/products/${item.category}/${item.slug}`}>
                      <h3 className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Cost breakdown */}
                    <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                      <p>Cost: ${formatPrice(item.wholesalePrice)} + 15% (${formatPrice(margin)})</p>
                      {item.rrp > item.ourPrice && (
                        <p className="text-green-600">
                          Saving ${formatPrice(item.rrp - item.ourPrice)} per unit vs RRP
                        </p>
                      )}
                    </div>

                    {/* Quantity & price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          className="px-2 py-1 hover:bg-gray-50 transition-colors"
                          onClick={() => updateQuantity(item.code, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button
                          className="px-2 py-1 hover:bg-gray-50 transition-colors"
                          onClick={() => updateQuantity(item.code, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">${formatPrice(lineTotal)}</span>
                        <button
                          onClick={() => removeItem(item.code)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {/* Per-item breakdown */}
              {items.map(item => (
                <div key={item.code} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">
                    {item.name} &times; {item.quantity}
                  </span>
                  <span className="font-mono flex-shrink-0">${formatPrice(item.ourPrice * item.quantity)}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-mono font-medium">${formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Postage</span>
                <span className="font-mono font-medium">
                  {postage === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${formatPrice(postage)}`
                  )}
                </span>
              </div>

              {postage > 0 && (
                <p className="text-xs text-gray-400">
                  Free shipping on orders over $99 (${formatPrice(99 - subtotal)} more)
                </p>
              )}

              <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-mono font-bold text-xl text-primary">${formatPrice(total)}</span>
              </div>

              {/* Total savings */}
              {(() => {
                const totalSavings = items.reduce(
                  (sum, item) => sum + Math.max(0, item.rrp - item.ourPrice) * item.quantity,
                  0
                )
                if (totalSavings <= 0) return null
                return (
                  <div className="bg-green-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-green-800">Total Savings vs RRP</span>
                      <span className="font-mono font-bold text-green-700">${formatPrice(totalSavings)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="mt-6">
              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/products" className="block text-center mt-3">
                <Button variant="ghost" className="w-full text-sm">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
