import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, postage } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: any) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.name,
            description: `${item.brand} | SKU: ${item.code}`,
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
          unit_amount: Math.round(item.ourPrice * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })
    )

    // Add postage as a line item if applicable
    if (postage > 0) {
      line_items.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Standard Delivery',
            description: 'Flat rate shipping - Free on orders over $99',
          },
          unit_amount: Math.round(postage * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
