'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Lock, ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CheckoutClient() {
  const { items, subtotal, postage, total, itemCount } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nothing to checkout</h1>
        <p className="text-gray-500 mb-6">Add some products to your cart first.</p>
        <Link href="/products">
          <Button size="lg">
            Browse Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            code: item.code,
            name: item.name,
            brand: item.brand,
            ourPrice: item.ourPrice,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          postage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/cart" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Order review */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Review</h2>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.code} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate mr-2">
                {item.name} &times; {item.quantity}
              </span>
              <span className="font-mono flex-shrink-0">${formatPrice(item.ourPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({itemCount} items)</span>
            <span className="font-mono font-medium">${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Postage</span>
            <span className="font-mono font-medium">
              {postage === 0 ? <span className="text-green-600">FREE</span> : `$${formatPrice(postage)}`}
            </span>
          </div>
          <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className="font-mono font-bold text-2xl text-primary">${formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Stripe checkout button */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full text-base"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Pay ${formatPrice(total)} with Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-400">
          You&apos;ll be redirected to Stripe&apos;s secure payment page to complete your purchase.
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> Secure checkout
          </span>
          <span>Powered by Stripe</span>
        </div>
      </div>
    </div>
  )
}
