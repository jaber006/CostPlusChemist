'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem {
  code: string
  name: string
  brand: string
  category: string
  wholesalePrice: number
  ourPrice: number
  rrp: number
  imageUrl: string
  quantity: number
  slug: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (code: string) => void
  updateQuantity: (code: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  postage: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = 'costplus-cart'
const FREE_SHIPPING_THRESHOLD = 99
const STANDARD_POSTAGE = 9.95

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {}
    setLoaded(true)
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.code === item.code)
      if (existing) {
        return prev.map(i =>
          i.code === item.code ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((code: string) => {
    setItems(prev => prev.filter(i => i.code !== code))
  }, [])

  const updateQuantity = useCallback((code: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.code !== code))
      return
    }
    setItems(prev =>
      prev.map(i => (i.code === code ? { ...i, quantity } : i))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.ourPrice * i.quantity, 0)
  const postage = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_POSTAGE
  const total = subtotal + postage

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        postage,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
