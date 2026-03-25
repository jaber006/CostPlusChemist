import { ArrowRight, Eye, TrendingDown, ShoppingCart, Truck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'How It Works - CostPlus Chemist',
  description: 'Learn how CostPlus Chemist provides transparent pharmacy pricing with just a 15% margin on wholesale costs.',
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How CostPlus Chemist Works</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We believe you deserve to know what your pharmacy products actually cost.
          Here&apos;s our radically simple pricing model.
        </p>
      </div>

      {/* The Formula */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary/20 p-8 sm:p-10 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Formula</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1 max-w-xs">
            <p className="text-sm text-gray-500 mb-1">Sigma wholesale cost</p>
            <p className="text-3xl font-bold font-mono text-gray-900">$X</p>
          </div>
          <span className="text-3xl font-bold text-primary">+</span>
          <div className="bg-white rounded-xl shadow-sm p-6 flex-1 max-w-xs">
            <p className="text-sm text-gray-500 mb-1">Our flat margin</p>
            <p className="text-3xl font-bold font-mono text-primary">15%</p>
          </div>
          <span className="text-3xl font-bold text-gray-400">=</span>
          <div className="bg-primary rounded-xl shadow-sm p-6 flex-1 max-w-xs">
            <p className="text-sm text-primary-100 mb-1">Your price</p>
            <p className="text-3xl font-bold font-mono text-white">$X &times; 1.15</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          That&apos;s it. Every product. Every time. No exceptions.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center">How It Works</h2>

        {[
          {
            icon: Eye,
            step: '1',
            title: 'We show you the wholesale cost',
            description: 'Every product page displays the exact price we pay Sigma Healthcare, one of Australia\'s largest pharmaceutical wholesalers. No secrets.',
          },
          {
            icon: TrendingDown,
            step: '2',
            title: 'We add a flat 15% margin',
            description: 'Our margin covers operating costs - staff, technology, storage, and delivery. A typical pharmacy marks up 30-50%. We charge 15%.',
          },
          {
            icon: ShoppingCart,
            step: '3',
            title: 'You shop with full transparency',
            description: 'Browse over 6,300 products with complete pricing breakdowns. Add to cart knowing you\'re getting a fair deal.',
          },
          {
            icon: Truck,
            step: '4',
            title: 'We deliver to your door',
            description: 'Standard delivery is $9.95, or free for orders over $99. Products shipped from our registered pharmacy in Legana, Tasmania.',
          },
        ].map(item => (
          <div key={item.step} className="flex gap-5">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Step {item.step}: {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Traditional vs CostPlus</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600"></th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Traditional Pharmacy</th>
                <th className="text-center py-3 px-4 font-semibold text-primary">CostPlus Chemist</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Pricing visible?', 'No', 'Yes - every product'],
                ['Typical markup', '30-50%+', 'Flat 15%'],
                ['Wholesale cost shown?', 'Never', 'Always'],
                ['Price consistency', 'Varies by store', 'Same formula always'],
                ['AHPRA registered?', 'Yes', 'Yes (PHA0002147134)'],
              ].map(([label, trad, costplus]) => (
                <tr key={label} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{label}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{trad}</td>
                  <td className="py-3 px-4 text-center font-medium text-primary">{costplus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to see the difference?</h2>
        <Link href="/products">
          <Button size="lg">
            Browse Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
