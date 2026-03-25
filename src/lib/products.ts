import productsData from '../../data/products.json'
import { slugify } from './utils'

export interface Product {
  code: string
  name: string
  brand: string
  category: string
  schedule: string
  wholesalePrice: number
  ourPrice: number
  rrp: number
  savings: number
  savingsPercent: number
  stock: number
  imageUrl: string
  searchText: string
  slug: string
}

export interface ProductsData {
  meta: {
    totalProducts: number
    categories: string[]
    brands: string[]
  }
  products: Product[]
}

// Augment products with slugs
const allProducts: Product[] = productsData.products.map((p: any) => ({
  ...p,
  slug: slugify(p.name),
}))

// Deduplicate slugs within same category by appending product code
const slugMap = new Map<string, number>()
for (const p of allProducts) {
  const key = `${p.category}/${p.slug}`
  slugMap.set(key, (slugMap.get(key) || 0) + 1)
}
for (const p of allProducts) {
  const key = `${p.category}/${p.slug}`
  if (slugMap.get(key)! > 1) {
    p.slug = `${p.slug}-${p.code}`
  }
}

export const products = allProducts
export const categories = productsData.meta.categories as string[]
export const brands = productsData.meta.brands as string[]

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

export function getProductBySlug(category: string, slug: string): Product | undefined {
  return products.find(p => p.category === category && p.slug === slug)
}

export function getProductByCode(code: string): Product | undefined {
  return products.find(p => p.code === code)
}

export function getCategories(): string[] {
  return categories
}

export function getCategoryProductCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const p of products) {
    counts[p.category] = (counts[p.category] || 0) + 1
  }
  return counts
}

export function getFeaturedProducts(): Product[] {
  // Return products with highest savings percentage that are in stock
  return [...products]
    .filter(p => p.savingsPercent > 0 && p.stock > 0)
    .sort((a, b) => b.savingsPercent - a.savingsPercent)
    .slice(0, 12)
}
