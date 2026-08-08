'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Download, BookOpen, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || 'cs_live_success'
  const plan = searchParams.get('plan') || 'lifetime'
  const isDemo = searchParams.get('demo') === 'true'

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-16 px-4 sm:px-6">
      {/* Dynamic backdrop */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,142,247,0.25),rgba(0,0,0,0))]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-xl w-full mx-auto p-8 sm:p-10 rounded-3xl border border-primary/20 bg-card/90 backdrop-blur-xl shadow-2xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-green-500/10 border border-green-500/30 text-green-400">
          <CheckCircle2 className="w-9 h-9 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            {plan === 'monthly' ? 'Pro Monthly Plan' : plan === 'annual' ? 'Pro Annual Plan' : 'Lifetime Access Activated'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Payment Confirmed!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome to Dominion Writer. Your account has been upgraded with full, unlimited publishing privileges.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="rounded-2xl bg-muted/40 border border-border/60 p-5 text-left space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Order Reference</span>
            <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{sessionId}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Plan Tier</span>
            <span className="font-semibold text-primary capitalize">{plan} Plan</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1 text-green-500 font-medium">
              <ShieldCheck className="w-4 h-4" /> Active & Verified
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Mode</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {isDemo ? 'Instant Simulator' : 'Stripe Production Checkout'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="flex-1 gradient-btn font-semibold text-white group shadow-lg shadow-primary/20"
          >
            <a href="/">
              <BookOpen className="w-4 h-4 mr-2" />
              Open Writer Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="sm:w-auto text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4 mr-2" /> Receipt
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          A receipt and subscription confirmation have also been logged to your account.
        </p>
      </motion.div>
    </div>
  )
}

export default function PricingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
