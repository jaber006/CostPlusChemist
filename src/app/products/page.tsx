import { products, getCategories } from '@/lib/products'
import { ProductsGrid } from './products-grid'

export const metadata = {
  title: 'All Products - CostPlus Chemist',
  description: 'Browse over 6,300 pharmacy products with transparent pricing. See the wholesale cost, our 15% margin, and how much you save.',
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">
          {products.length.toLocaleString()} products with transparent cost-plus pricing
        </p>
      </div>
      <ProductsGrid
        initialProducts={JSON.parse(JSON.stringify(products))}
        categories={getCategories()}
      />
    </div>
  )
}
