import Link from 'next/link'
import { ArrowRight, Shield, Eye, TrendingDown, Truck, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getFeaturedProducts, getCategoryProductCounts, getCategories } from '@/lib/products'
import { formatPrice, categoryLabel } from '@/lib/utils'
import { FeaturedProducts } from './featured-products'

const CATEGORY_ICONS: Record<string, string> = {
  'Pain-Relief': '💊',
  'Allergy-Hayfever': '🤧',
  'Cough-Cold': '🤒',
  'Skincare': '✨',
  'Digestive-Health': '🫄',
  'First-Aid': '🩹',
  'Eye-Ear': '👁',
  'Oral-Care': '🦷',
  'Nutrition': '🥗',
  'Hair-Care': '💇',
  'Suncare': '☀️',
  'Natural-Medicine': '🌿',
}

export default function HomePage() {
  const featured = getFeaturedProducts()
  const counts = getCategoryProductCounts()
  const categories = getCategories()
  // Show top categories by product count
  const topCategories = categories
    .map(c => ({ name: c, count: counts[c] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="success" className="mb-4 text-sm px-3 py-1">
              Australia&apos;s First Transparent Pharmacy
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              See what we pay.{' '}
              <span className="text-primary">Pay just 15% more.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              We show you the exact wholesale cost of every product, then add a flat 15% margin.
              That&apos;s it. No hidden markups, no inflated RRPs. Just honest pharmacy pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  <Search className="w-5 h-5 mr-2" />
                  Browse 6,333 Products
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                  How It Works
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Price breakdown example */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">The CostPlus Difference</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here&apos;s how we price a real product. Every single item in our store follows this exact formula.
            </p>
          </div>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900">Example: Panadol Rapid 40 Caplets</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wholesale cost (Sigma)</span>
                <span className="font-mono font-semibold">$6.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">+ Our 15% margin</span>
                <span className="font-mono font-semibold text-primary">+ $0.98</span>
              </div>
              <div className="border-t-2 border-primary/20 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Your Price</span>
                <span className="font-mono font-bold text-2xl text-primary">$7.48</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Typical pharmacy price</span>
                <span className="font-mono text-gray-400 line-through">$12.99</span>
              </div>
              <div className="bg-green-50 -mx-6 -mb-5 px-6 py-4 flex justify-between items-center">
                <span className="font-bold text-green-800">You Save</span>
                <span className="font-mono font-bold text-green-700 text-lg">$5.51 (42%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">100% Transparent</h3>
              <p className="text-xs text-gray-500 mt-1">See our cost on every product</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">Flat 15% Margin</h3>
              <p className="text-xs text-gray-500 mt-1">No hidden markups ever</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">AHPRA Registered</h3>
              <p className="text-xs text-gray-500 mt-1">PHA0002147134</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900">Free Shipping $99+</h3>
              <p className="text-xs text-gray-500 mt-1">$9.95 flat rate under $99</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-gray-600">6,333 products across {categories.length} categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topCategories.map(cat => (
              <Link
                key={cat.name}
                href={`/products/${cat.name}`}
                className="group bg-gray-50 hover:bg-primary/5 border border-gray-200 hover:border-primary/30 rounded-xl p-4 text-center transition-all duration-200"
              >
                <div className="text-2xl mb-2">{CATEGORY_ICONS[cat.name] || '💊'}</div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {categoryLabel(cat.name)}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count} products</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products">
              <Button variant="outline">
                View All Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Biggest Savings</h2>
            <p className="text-gray-600">Products where transparent pricing saves you the most</p>
          </div>
          <FeaturedProducts products={featured} />
          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg">
                Browse All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to stop overpaying for pharmacy products?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of Australians who are saving with transparent pricing.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-base">
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
