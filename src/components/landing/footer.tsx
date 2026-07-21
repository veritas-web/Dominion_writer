'use client'

import { useAppStore } from '@/store/app-store'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const setView = useAppStore((s) => s.setView)

  return (
    <footer className="mt-auto w-full bg-[#0D1117] border-t border-dw-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold gradient-text">Dominion Writer</h3>
            <p className="text-sm leading-relaxed text-dw-text-muted max-w-xs">
              Write Without Limits. Create Without Compromise. An AI-powered
              book writing platform that puts authors in control.
            </p>
          </div>

          {/* Quick Links column */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-dw-text">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setView('about')}
                className="text-left text-sm text-dw-text-muted transition-colors hover:text-dw-text"
              >
                About
              </button>
              <button
                onClick={() => setView('privacy')}
                className="text-left text-sm text-dw-text-muted transition-colors hover:text-dw-text"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setView('terms')}
                className="text-left text-sm text-dw-text-muted transition-colors hover:text-dw-text"
              >
                Terms of Service
              </button>
            </nav>
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-dw-text">
              Contact
            </h4>
            <a
              href="mailto:admin@dominionwriter.com"
              className="text-sm text-dw-text-muted transition-colors hover:text-dw-accent-blue"
            >
              admin@dominionwriter.com
            </a>
          </div>
        </div>

        <Separator className="my-8 bg-dw-border" />

        <p className="text-center text-xs text-dw-text-muted">
          &copy; 2025 Dominion Writer. Owned by Mr. Nghia Nguyen. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}