'use client'

import { useAppStore } from '@/store/app-store'
import { aboutContent } from '@/lib/legal-content'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function AboutPage() {
  const setView = useAppStore((s) => s.setView)

  return (
    <div className="animate-fade-in px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-8 text-dw-text-muted hover:text-dw-text hover:bg-dw-card"
          onClick={() => setView('landing')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Page title */}
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-10">
          <span className="gradient-text">{aboutContent.title}</span>
        </h1>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {aboutContent.sections.map((section, idx) => (
            <section key={idx} className="animate-slide-in" style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}>
              <h2 className="text-xl font-semibold text-dw-text sm:text-2xl mb-4">
                {section.heading}
              </h2>
              <div className="whitespace-pre-line text-dw-text-muted leading-relaxed text-[0.95rem]">
                {section.text}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom back link */}
        <div className="mt-16 mb-8">
          <Button
            variant="ghost"
            className="text-dw-text-muted hover:text-dw-text hover:bg-dw-card"
            onClick={() => setView('landing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}