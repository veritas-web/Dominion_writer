'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import {
  Key,
  Layers,
  Infinity,
  FileDown,
  BookOpen,
  PenTool,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react'

const features = [
  {
    icon: Key,
    title: 'BYO API Key',
    description:
      'Bring your own AI provider API key. No credit limits, no hidden fees — you pay your AI provider directly for what you use.',
  },
  {
    icon: Layers,
    title: 'Multi-Provider Support',
    description:
      'Connect up to 3 AI providers simultaneously. Combine the strengths of different models for storytelling, research, and editing.',
  },
  {
    icon: Infinity,
    title: 'Lifetime Membership',
    description:
      'Pay once, write forever. No subscriptions, no recurring charges. Your writing platform grows with you.',
  },
  {
    icon: FileDown,
    title: 'Export to DOCX, PDF & EPUB',
    description:
      'When your manuscript is ready, export it in professional formats ready for editors, publishers, or self-publishing.',
  },
  {
    icon: BookOpen,
    title: 'Book-Style Editor',
    description:
      'A distraction-free, book-focused writing environment designed for long-form projects — not blog posts.',
  },
  {
    icon: PenTool,
    title: 'No Word Count Limits',
    description:
      'Write as much as you need. No artificial caps on words, chapters, or projects. Your story sets the length.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description:
      'Create your account in seconds. Choose the lifetime plan and get immediate access to the full platform.',
  },
  {
    number: '02',
    title: 'Connect Your AI Key',
    description:
      'Add your preferred AI provider API key. Use one provider or up to three working together in harmony.',
  },
  {
    number: '03',
    title: 'Start Writing',
    description:
      'Open the book-style editor and bring your ideas to life. Write chapters, generate content, and export when ready.',
  },
]

export function LandingPage() {
  const setView = useAppStore((s) => s.setView)

  return (
    <div className="flex flex-col">
      {/* ───── Hero ───── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-24 md:pt-32 md:pb-32 text-center animate-fade-in">
        {/* Subtle radial glow behind the heading */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="h-[500px] w-[700px] rounded-full bg-dw-accent-blue/10 blur-[120px]" />
        </div>

        <h1 className="relative z-10 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Your only limitation is{' '}
          <span className="gradient-text">your imagination</span>
        </h1>

        <p className="relative z-10 mt-6 max-w-2xl text-lg text-dw-text-muted sm:text-xl md:text-2xl">
          Write Without Limits. Create Without Compromise.
        </p>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="gradient-btn px-8 py-6 text-lg font-semibold text-white"
            onClick={() => setView('signup')}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Start Writing
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-dw-border bg-transparent px-8 py-6 text-lg text-dw-text hover:bg-dw-card hover:text-white"
            onClick={() => setView('login')}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </Button>
        </div>

        <p className="relative z-10 mt-6 text-sm text-dw-text-muted">
          Owned by Mr. Nghia Nguyen
        </p>
      </section>

      {/* ───── Features Grid ───── */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything You Need to{' '}
              <span className="gradient-text">Write Your Book</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-dw-text-muted text-lg">
              A platform designed for authors who refuse to be limited by
              credit systems, subscriptions, or restrictive software.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`glass-card p-6 transition-colors hover:bg-dw-card-hover animate-slide-in`}
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-dw-accent-blue/10">
                  <feature.icon className="h-5 w-5 text-dw-accent-blue" />
                </div>
                <h3 className="text-lg font-semibold text-dw-text">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dw-text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="px-4 pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-4 text-dw-text-muted text-lg">
              Three simple steps to start writing your book.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="relative animate-slide-in"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                {/* Connector line (desktop only) */}
                {idx < steps.length - 1 && (
                  <div
                    className="absolute top-6 left-[calc(100%_-_0.5rem)] hidden h-px w-[calc(100%_-_1.5rem)] bg-gradient-to-r from-dw-accent-blue/50 to-dw-accent-purple/50 md:block"
                    aria-hidden="true"
                  />
                )}

                <div className="glass-card p-6 text-center h-full">
                  <span className="gradient-text text-4xl font-extrabold">
                    {step.number}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-dw-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dw-text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center animate-fade-in">
            <Button
              size="lg"
              className="gradient-btn px-8 py-6 text-lg font-semibold text-white"
              onClick={() => setView('signup')}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}