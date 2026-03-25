'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'

export function Header() {
  const { itemCount } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C+</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-lg">CostPlus</span>
              <span className="font-light text-primary text-lg"> Chemist</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="/products" className="md:hidden">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/products"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/how-it-works"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/faq"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              FAQ
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
