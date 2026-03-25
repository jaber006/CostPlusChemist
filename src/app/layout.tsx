import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CostPlus Chemist - Transparent Pharmacy Pricing',
  description:
    "Australia's first transparent-pricing online pharmacy. We show you our wholesale cost, add just 15%, and that's your price. No hidden markups.",
  keywords: ['pharmacy', 'online pharmacy', 'Australia', 'transparent pricing', 'cost plus', 'discount pharmacy'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
