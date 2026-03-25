import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C+</span>
              </div>
              <div>
                <span className="font-bold text-white text-lg">CostPlus</span>
                <span className="font-light text-primary text-lg"> Chemist</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md mb-4">
              Australia&apos;s first transparent-pricing online pharmacy. We show you exactly
              what we pay for every product, then add just 15% on top. No hidden markups, no games.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Registered Pharmacy
              </span>
              <span>AHPRA PHA0002147134</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/products/Pain-Relief" className="text-sm hover:text-primary transition-colors">Pain Relief</Link></li>
              <li><Link href="/products/Allergy-Hayfever" className="text-sm hover:text-primary transition-colors">Allergy & Hayfever</Link></li>
              <li><Link href="/products/Skincare" className="text-sm hover:text-primary transition-colors">Skincare</Link></li>
              <li><Link href="/products/Cough-Cold" className="text-sm hover:text-primary transition-colors">Cough & Cold</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/cart" className="text-sm hover:text-primary transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} CostPlus Chemist | ABN: TBD | Legana, Tasmania
            </p>
            <p className="text-xs text-gray-500">
              Pharmacist: Mohammad Jaber (AHPRA PHA0002147134)
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
