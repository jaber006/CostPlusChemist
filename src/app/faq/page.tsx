import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'FAQ - CostPlus Chemist',
  description: 'Frequently asked questions about CostPlus Chemist transparent pharmacy pricing.',
}

const faqs = [
  {
    q: 'How can you sell products so cheaply?',
    a: "We don't sell cheaply - we sell fairly. Traditional pharmacies mark up products 30-50% or more. We show you our wholesale cost from Sigma Healthcare and add just 15%. There are no hidden margins, promotional deals, or loss leaders. Every product follows the same transparent formula.",
  },
  {
    q: 'Is CostPlus Chemist a real pharmacy?',
    a: 'Yes. CostPlus Chemist is a registered Australian pharmacy. Our pharmacist, Mohammad Jaber, is registered with AHPRA (Registration: PHA0002147134). We are based in Legana, Tasmania and comply with all Australian pharmacy regulations.',
  },
  {
    q: 'What does the 15% margin cover?',
    a: 'Our 15% margin covers all operating costs including pharmacist salaries, technology, warehousing, insurance, and regulatory compliance. We keep our overhead low by operating online-only, which allows us to pass savings directly to you.',
  },
  {
    q: 'Where do your products come from?',
    a: 'All our products are sourced from Sigma Healthcare (via Sigma Connect), one of Australia\'s largest and most trusted pharmaceutical wholesalers. These are the exact same products you\'d find at any Australian pharmacy.',
  },
  {
    q: 'What are the S2 and S3 schedule badges?',
    a: 'In Australia, medicines are classified by schedule. General Sale (GS) products can be sold anywhere. Pharmacy Medicine (S2) products must be sold from a pharmacy. Pharmacist Only (S3) products require direct pharmacist involvement. We display these badges so you know exactly what you\'re buying.',
  },
  {
    q: 'How much is shipping?',
    a: "Standard shipping is a flat $9.95 anywhere in Australia. Orders over $99 receive free shipping. We ship from our pharmacy in Legana, Tasmania.",
  },
  {
    q: 'Can I return products?',
    a: 'Due to the nature of pharmaceutical products, we follow standard pharmacy return policies. Faulty or incorrectly supplied items will be replaced or refunded. Please contact us within 7 days of receiving your order if there are any issues.',
  },
  {
    q: 'Why show the wholesale price?',
    a: "Transparency is our core value. We believe every Australian deserves to know what they're really paying for. By showing the wholesale cost, you can verify that our 15% margin is exactly what we say it is. No other pharmacy in Australia does this.",
  },
  {
    q: 'Do you offer prescription medications?',
    a: 'Currently, CostPlus Chemist focuses on over-the-counter (OTC) pharmacy products. We plan to expand into prescription medications in the future, with the same transparent pricing model.',
  },
  {
    q: 'How do I contact you?',
    a: 'You can reach us by email. As a small pharmacy startup, we\'re committed to responding to every query promptly. Your pharmacist, Mohammad Jaber, is personally involved in customer care.',
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about CostPlus Chemist.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500 mb-4">Still have questions?</p>
        <Link href="/products">
          <Button size="lg">
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
