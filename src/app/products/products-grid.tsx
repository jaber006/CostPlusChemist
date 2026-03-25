'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product-card'
import { categoryLabel } from '@/lib/utils'
import type { Product } from '@/lib/products'

const PAGE_SIZE = 24

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'savings' | 'brand'

interface ProductsGridProps {
  initialProducts: Product[]
  categories: string[]
  initialCategory?: string
}

export function ProductsGrid({ initialProducts, categories, initialCategory }: ProductsGridProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory || '')
  const [sort, setSort] = useState<SortOption>('savings')
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(
    () =>
      new Fuse(initialProducts, {
        keys: ['name', 'brand', 'category'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [initialProducts]
  )

  const filtered = useMemo(() => {
    let results = search.trim()
      ? fuse.search(search.trim()).map(r => r.item)
      : [...initialProducts]

    if (category) {
      results = results.filter(p => p.category === category)
    }

    switch (sort) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-asc':
        results.sort((a, b) => a.ourPrice - b.ourPrice)
        break
      case 'price-desc':
        results.sort((a, b) => b.ourPrice - a.ourPrice)
        break
      case 'savings':
        results.sort((a, b) => b.savingsPercent - a.savingsPercent)
        break
      case 'brand':
        results.sort((a, b) => a.brand.localeCompare(b.brand))
        break
    }

    return results
  }, [initialProducts, search, category, sort, fuse])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, category, sort])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleCount, filtered.length])

  const visible = filtered.slice(0, visibleCount)

  return (
    <div>
      {/* Search & filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        {!initialCategory && (
          <Select value={category} onChange={e => setCategory(e.target.value)} className="sm:w-48">
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {categoryLabel(c)}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="sm:w-44"
        >
          <option value="savings">Biggest Savings</option>
          <option value="name">Name A-Z</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="brand">Brand A-Z</option>
        </Select>
      </div>

      {/* Active filters */}
      {(search || category) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">
            {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''}
          </span>
          {search && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearch('')}>
              &quot;{search}&quot; <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          )}
          {category && !initialCategory && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategory('')}>
              {categoryLabel(category)} <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          )}
        </div>
      )}

      {/* Products grid */}
      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {visible.map(product => (
              <ProductCard key={product.code} product={product} />
            ))}
          </div>

          {/* Load more sentinel */}
          {visibleCount < filtered.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="text-sm text-gray-400">
                Showing {visible.length} of {filtered.length.toLocaleString()} products...
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No products found</p>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
          <Button variant="outline" onClick={() => { setSearch(''); setCategory('') }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
