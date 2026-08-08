import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    const settings = await db.siteSettings.get()
    const secretKey = settings.stripeSecretKey || ''
    const webhookSecret = settings.stripeWebhookSecret || ''

    let event: Stripe.Event

    if (secretKey && webhookSecret && signature) {
      const stripe = new Stripe(secretKey)
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
      }
    } else {
      // Unsigned or direct JSON payload for testing
      event = JSON.parse(payload)
    }

    console.log('Stripe webhook received event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerEmail = session.customer_details?.email || session.customer_email || session.metadata?.userEmail || ''
        const planSlug = session.metadata?.planSlug || 'lifetime'
        const amountTotal = (session.amount_total || 0) / 100

        if (customerEmail) {
          // Activate user plan in Supabase
          const existingUser = await db.user.findUnique({ where: { email: customerEmail } })
          if (existingUser) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                planActive: true,
                planType: planSlug,
                stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
                stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
              },
            })
          }

          // Record transaction
          await db.transaction.create({
            data: {
              userId: existingUser?.id,
              userEmail: customerEmail,
              amount: amountTotal || 99,
              currency: session.currency || 'usd',
              planType: planSlug,
              stripeSessionId: session.id,
              stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            },
          })

          // Record audit log
          await db.auditLog.create({
            data: {
              action: 'STRIPE_PAYMENT_SUCCESS',
              performedBy: 'stripe_webhook',
              targetId: existingUser?.id || customerEmail,
              details: `Activated ${planSlug} plan for ${customerEmail} ($${amountTotal})`,
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : ''
        if (customerId) {
          // Deactivate plan if subscription cancels
          const { data: users } = await (await import('@/lib/db')).supabase
            .from('User')
            .select('*')
            .eq('stripeCustomerId', customerId)

          if (users && users.length > 0) {
            await db.user.update({
              where: { id: users[0].id },
              data: { planActive: false, planType: 'free' },
            })
            await db.auditLog.create({
              data: {
                action: 'SUBSCRIPTION_CANCELED',
                performedBy: 'stripe_webhook',
                targetId: users[0].id,
                details: `Subscription canceled for ${users[0].email}`,
              },
            })
          }
        }
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error)
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 })
  }
}
