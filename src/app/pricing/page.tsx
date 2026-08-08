'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Shield, Zap, ArrowLeft, Loader2, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function PricingPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [billingCycle, setBillingCycle] = useState<'lifetime' | 'monthly' | 'annual'>('lifetime')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/plans')
      .then(res => res.json())
      .then(data => {
        if (data.plans) setPlans(data.plans)
        if (data.settings) setSettings(data.settings)
      })
      .catch(() => {
        // Fallback default plans
        setPlans([
          {
            id: 'plan_lifetime',
            name: 'Lifetime Access',
            slug: 'lifetime',
            price: 99,
            interval: 'one-time',
            description: 'One payment. Access to all current and future features forever.',
            features: [
              'Unlimited AI book drafting & editing',
              'Smart Chapter Assistant & rewriting tools',
              'Export to EPUB, PDF, and DOCX formats',
              'Front matter & back matter generator',
              'Auto Table of Contents & Bibliography',
              'Lifetime software updates & improvements',
              'Commercial rights for published works',
            ],
            isPopular: true,
          },
          {
            id: 'plan_monthly',
            name: 'Pro Monthly',
            slug: 'monthly',
            price: 19,
            interval: 'month',
            description: 'Flexible month-to-month subscription for active authors.',
            features: [
              'Unlimited AI writing assistance',
              'Full book & chapter management',
              'Standard export to EPUB and PDF',
              'Glossary and citation tools',
              'Custom API key integration',
            ],
            isPopular: false,
          },
          {
            id: 'plan_annual',
            name: 'Pro Annual',
            slug: 'annual',
            price: 149,
            interval: 'year',
            description: 'Best annual value. Save 35% compared to monthly.',
            features: [
              'Everything in Pro Monthly',
              'Save $79 per year (2 months free)',
              'Priority AI processing speed',
              'Advanced book styling & formatting',
              'Priority email customer support',
            ],
            isPopular: false,
          },
        ])
      })
  }, [])

  const handleCheckout = async (planSlug: string, priceId?: string) => {
    setLoadingPlan(planSlug)
    toast.loading('Initializing secure Stripe checkout...', { id: 'checkout' })

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          priceId,
          customerEmail: session?.user?.email,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to initiate checkout')
      }

      if (data.url) {
        toast.success(data.demo ? 'Redirecting to instant activation...' : 'Redirecting to Stripe...', { id: 'checkout' })
        setTimeout(() => {
          window.location.href = data.url
        }, 600)
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      toast.error(err.message || 'Payment initiation failed. Please try again.', { id: 'checkout' })
      setLoadingPlan(null)
    }
  }

  const lifetimePlan = plans.find(p => p.slug === 'lifetime') || {
    name: 'Lifetime Access',
    price: settings?.lifetimePrice || 99,
    description: 'Stop paying monthly subscriptions. Get full access to all premium features forever with a single payment.',
    features: [
      'Unlimited AI writing assistance',
      'Advanced formatting tools',
      'Export to all major formats (EPUB, PDF, DOCX)',
      'Priority email support',
      'Access to all future features',
      'Commercial usage rights',
    ],
  }

  const monthlyPlan = plans.find(p => p.slug === 'monthly') || {
    name: 'Pro Monthly',
    price: settings?.monthlyPrice || 19,
    description: 'Billed month-to-month. Cancel anytime with one click.',
    features: [
      'Unlimited AI drafting',
      'All export formats included',
      'Chapter & book management',
      'Standard AI generation',
    ],
  }

  const annualPlan = plans.find(p => p.slug === 'annual') || {
    name: 'Pro Annual',
    price: settings?.annualPrice || 149,
    description: 'Save 35% annually. Ideal for prolific authors and novelists.',
    features: [
      'Everything in Pro Monthly',
      '2 months completely free',
      'Priority generation speed',
      'VIP email support',
    ],
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6">
      {/* Top back nav */}
      <div className="w-full max-w-7xl px-4 flex justify-between items-center mb-8">
        <a
          href="/"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Writer Platform
        </a>
        {session?.user && (
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Logged in as {session.user.email}
          </span>
        )}
      </div>

      {/* Radial glow background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,142,247,0.25),rgba(0,0,0,0))]"></div>

      <div className="mx-auto max-w-7xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold tracking-wide uppercase text-primary"
        >
          Simple, Transparent Pricing
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70"
        >
          One payment. Lifetime access.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          No monthly lock-in. Get full access to AI book creation, smart chapter formatting, and publishing tools forever.
        </motion.p>

        {/* Featured Hero Lifetime Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mx-auto mt-12 max-w-4xl rounded-3xl border border-primary/30 bg-card/95 shadow-2xl backdrop-blur-md overflow-hidden text-left relative"
        >
          {/* Popular ribbon */}
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-l from-primary to-purple-600 text-white text-xs font-bold px-5 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:flex lg:items-center lg:justify-between gap-10">
            <div className="lg:flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {lifetimePlan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Pay once, own Dominion Writer forever</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {lifetimePlan.description}
              </p>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Everything included in your license:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-muted-foreground">
                  {(Array.isArray(lifetimePlan.features) ? lifetimePlan.features : [
                    'Unlimited AI writing assistance',
                    'Advanced formatting & chapter tools',
                    'Export to EPUB, PDF, and DOCX',
                    'Priority email support',
                    'All future updates included',
                    'Full commercial publishing rights',
                  ]).map((feat: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="mt-8 lg:mt-0 lg:w-80 shrink-0">
              <div className="rounded-2xl bg-muted/40 border border-border/80 p-6 sm:p-8 text-center space-y-6 backdrop-blur-xl">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground flex justify-center items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-primary" /> Secure One-Time Stripe Payment
                  </p>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground">
                      ${lifetimePlan.price}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">USD / Lifetime</span>
                  </div>
                  <p className="text-[11px] text-green-400 font-medium mt-1">Zero recurring fees. No subscriptions.</p>
                </div>

                <Button
                  onClick={() => handleCheckout('lifetime')}
                  disabled={loadingPlan !== null}
                  size="lg"
                  className="w-full gradient-btn font-semibold text-white group shadow-lg shadow-primary/25 h-12"
                >
                  {loadingPlan === 'lifetime' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Get Lifetime Access <Zap className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                    </span>
                  )}
                </Button>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <p className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Instant account activation
                  </p>
                  <p>Invoices and VAT receipts automatically provided</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Subscription Options (Monthly / Annual) */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">Alternative Subscription Plans</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Monthly */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{monthlyPlan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{monthlyPlan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${monthlyPlan.price}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {(Array.isArray(monthlyPlan.features) ? monthlyPlan.features : [
                  'Unlimited AI writing assistance',
                  'Standard chapter & book tools',
                  'EPUB & PDF exports',
                ]).map((f: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() => handleCheckout('monthly')}
                disabled={loadingPlan !== null}
                className="w-full mt-2"
              >
                {loadingPlan === 'monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choose Monthly'}
              </Button>
            </div>

            {/* Annual */}
            <div className="p-6 rounded-2xl border border-primary/25 bg-card/60 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-colors relative">
              <span className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                Save 35%
              </span>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{annualPlan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{annualPlan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${annualPlan.price}</span>
                  <span className="text-xs text-muted-foreground">/yr</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {(Array.isArray(annualPlan.features) ? annualPlan.features : [
                  'Everything in Pro Monthly',
                  '2 months free ($79 savings)',
                  'Priority generation queues',
                ]).map((f: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                onClick={() => handleCheckout('annual')}
                disabled={loadingPlan !== null}
                className="w-full mt-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                {loadingPlan === 'annual' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choose Annual (Best Value)'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
