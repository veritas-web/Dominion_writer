'use client'

import { useAppStore } from '@/store/app-store'
import { privacyContent } from '@/lib/legal-content'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function extractBulletItems(text: string): { intro: string; bullets: string[] } | null {
  // Look for "Users may not:" or similar list patterns
  const listMatch = text.match(/^(.*?:)\s*([\s\S]*)$/)
  if (!listMatch) return null

  // Split the remaining text by commas that start list items (capitalized words)
  const intro = listMatch[1]
  const body = listMatch[2]

  const bullets = body
    .split(/,\s*(?=[A-Z])/)
    .map((b) => b.replace(/\.$/, '').trim())
    .filter(Boolean)

  if (bullets.length > 2) {
    return { intro, bullets }
  }
  return null
}

export function PrivacyPage() {
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

        {/* Header */}
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl mb-4">
          <span className="gradient-text">{privacyContent.title}</span>
        </h1>
        <div className="mb-10 flex flex-col gap-1 text-sm text-dw-text-muted sm:flex-row sm:gap-4">
          <span>Effective: {privacyContent.effectiveDate}</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>Owner: {privacyContent.owner}</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>Contact: {privacyContent.contact}</span>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {privacyContent.sections.map((section) => {
            const hasItems = 'items' in section && Array.isArray(section.items)

            return (
              <section key={section.number} className="animate-slide-in" style={{ animationDelay: `${Number(section.number) * 40}ms`, animationFillMode: 'both' }}>
                <h2 className="text-xl font-semibold text-dw-text sm:text-2xl mb-4">
                  <span className="text-dw-accent-blue mr-2">{section.number}.</span>
                  {section.title}
                </h2>

                {hasItems ? (
                  <div className="flex flex-col gap-6">
                    {(section as { items: { subtitle: string; text: string }[] }).items.map((item, idx) => {
                      // Check for list items in section 10 pattern
                      const bulletCheck = extractBulletItems(item.text)
                      return (
                        <div key={idx}>
                          {item.subtitle && (
                            <h3 className="text-base font-medium text-dw-text mb-2">
                              {item.subtitle}
                            </h3>
                          )}
                          {bulletCheck ? (
                            <div>
                              <p className="text-dw-text-muted leading-relaxed text-[0.95rem]">
                                {bulletCheck.intro}
                              </p>
                              <ul className="mt-2 ml-5 list-disc space-y-1 text-dw-text-muted text-[0.95rem]">
                                {bulletCheck.bullets.map((bullet, bIdx) => (
                                  <li key={bIdx} className="leading-relaxed">{bullet}</li>
                                ))}
                              </ul>
                              {/* Remaining text after the bullet list */}
                            </div>
                          ) : (
                            <p className="whitespace-pre-line text-dw-text-muted leading-relaxed text-[0.95rem]">
                              {item.text}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <>
                    {'text' in section && section.number === '10' ? (
                      (() => {
                        const bulletCheck = extractBulletItems(section.text as string)
                        if (bulletCheck) {
                          return (
                            <div>
                              <p className="text-dw-text-muted leading-relaxed text-[0.95rem]">
                                {bulletCheck.intro}
                              </p>
                              <ul className="mt-2 ml-5 list-disc space-y-1 text-dw-text-muted text-[0.95rem]">
                                {bulletCheck.bullets.map((bullet, bIdx) => (
                                  <li key={bIdx} className="leading-relaxed">{bullet}</li>
                                ))}
                              </ul>
                              {/* Trailing sentence */}
                              {section.text!.split(/,\s*(?=Users are solely)/)[1] && (
                                <p className="mt-3 text-dw-text-muted leading-relaxed text-[0.95rem]">
                                  Users are solely responsible for all content generated using Dominion Writer. Dominion Writer does not review or approve user content before publication. Violation of this Acceptable Use Policy may result in immediate suspension or termination of access without refund.
                                </p>
                              )}
                            </div>
                          )
                        }
                        return (
                          <p className="whitespace-pre-line text-dw-text-muted leading-relaxed text-[0.95rem]">
                            {section.text as string}
                          </p>
                        )
                      })()
                    ) : (
                      <p className="whitespace-pre-line text-dw-text-muted leading-relaxed text-[0.95rem]">
                        {section.text as string}
                      </p>
                    )}
                  </>
                )}
              </section>
            )
          })}
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