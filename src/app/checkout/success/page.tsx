'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 text-lg mb-2">
        Thank you for your order. You&apos;ll receive a confirmation email shortly.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Your order will be shipped from our pharmacy in Legana, Tasmania.
      </p>
      <Link href="/products">
        <Button size="lg">
          Continue Shopping
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    </div>
  )
}
