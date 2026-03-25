import { CheckoutClient } from './checkout-client'

export const metadata = {
  title: 'Checkout - CostPlus Chemist',
  description: 'Complete your order with secure Stripe checkout.',
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
