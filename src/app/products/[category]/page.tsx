import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getProductsByCategory, getCategories } from '@/lib/products'
import { categoryLabel } from '@/lib/utils'
import { ProductsGrid } from '../products-grid'

interface CategoryPageProps {
  params: { category: string }
}

export function generateStaticParams() {
  return getCategories().map(category => ({ category }))
}

export function generateMetadata({ params }: CategoryPageProps) {
  const label = categoryLabel(params.category)
  return {
    title: `${label} - CostPlus Chemist`,
    description: `Browse ${label} products with transparent cost-plus pricing at CostPlus Chemist.`,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categories = getCategories()
  if (!categories.includes(params.category)) {
    notFound()
  }

  const products = getProductsByCategory(params.category)
  const label = categoryLabel(params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{label}</h1>
        <p className="text-gray-600">
          {products.length.toLocaleString()} products with transparent pricing
        </p>
      </div>

      <ProductsGrid
        initialProducts={JSON.parse(JSON.stringify(products))}
        categories={categories}
        initialCategory={params.category}
      />
    </div>
  )
}
