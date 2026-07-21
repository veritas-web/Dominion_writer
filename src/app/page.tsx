'use client'

import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { useSession, SessionProvider } from 'next-auth/react'
import { useAppStore } from '@/store/app-store'
import { LandingPage } from '@/components/landing/landing-page'
import { AboutPage } from '@/components/legal/about-page'
import { PrivacyPage } from '@/components/legal/privacy-page'
import { TermsPage } from '@/components/legal/terms-page'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'
import { ProfilePage } from '@/components/profile/profile-page'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { BookWizard } from '@/components/wizard/book-wizard'
import { BookEditor } from '@/components/editor/book-editor'
import { Footer } from '@/components/landing/footer'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { data: session, status } = useSession()
  const { currentView, setView, setUser, logout, selectedBookId } = useAppStore()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: (session.user as any).id || session.user.email || '',
        email: session.user.email || '',
        fullName: session.user.name || null,
      })
    }
  }, [status, session, setUser])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {}
    logout()
  }, [logout])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F19' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
      </div>
    )
  }

  const showFooter = ['landing', 'about', 'privacy', 'terms', 'login', 'signup'].includes(currentView)
  const showHeader = !['editor'].includes(currentView)

  const renderView = () => {
    switch (currentView) {
      case 'landing': return <LandingPage />
      case 'about': return <AboutPage />
      case 'privacy': return <PrivacyPage />
      case 'terms': return <TermsPage />
      case 'login': return <LoginForm />
      case 'signup': return <SignupForm />
      case 'dashboard': return <DashboardPage />
      case 'profile': return <ProfilePage />
      case 'wizard': return <BookWizard />
      case 'editor': return selectedBookId ? <BookEditor bookId={selectedBookId} /> : <DashboardPage />
      default: return <LandingPage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0F19' }}>
      {showHeader && (
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: 'rgba(11, 15, 25, 0.85)', borderColor: '#1E293B' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <button onClick={() => setView('landing')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl font-bold gradient-text">Dominion Writer</span>
            </button>
            <nav className="hidden sm:flex items-center gap-1">
              <button onClick={() => setView('about')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all">About</button>
              <button onClick={() => setView('privacy')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all">Privacy</button>
              <button onClick={() => setView('terms')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all">Terms</button>
            </nav>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <button onClick={() => setView('dashboard')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all hidden sm:block">Dashboard</button>
                  <button onClick={() => setView('profile')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all hidden sm:block">Profile</button>
                  <span className="px-2 py-1 text-xs rounded bg-[#1E293B] text-[#94A3B8] hidden md:block max-w-[160px] truncate">{session.user?.email}</span>
                  <button onClick={handleLogout} className="px-3 py-1.5 text-sm rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => setView('login')} className="px-3 py-1.5 text-sm rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-all">Sign In</button>
                  <button onClick={() => setView('signup')} className="gradient-btn px-4 py-1.5 text-sm rounded-lg text-white font-medium">Get Started</button>
                </>
              )}
            </div>
          </div>
          {/* Mobile nav */}
          <div className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
            <button onClick={() => setView('about')} className="px-2 py-1 text-xs rounded text-[#94A3B8] hover:text-[#E2E8F0] whitespace-nowrap">About</button>
            <button onClick={() => setView('privacy')} className="px-2 py-1 text-xs rounded text-[#94A3B8] hover:text-[#E2E8F0] whitespace-nowrap">Privacy</button>
            <button onClick={() => setView('terms')} className="px-2 py-1 text-xs rounded text-[#94A3B8] hover:text-[#E2E8F0] whitespace-nowrap">Terms</button>
            {session && (
              <>
                <button onClick={() => setView('dashboard')} className="px-2 py-1 text-xs rounded text-[#94A3B8] hover:text-[#E2E8F0] whitespace-nowrap">Dashboard</button>
                <button onClick={() => setView('profile')} className="px-2 py-1 text-xs rounded text-[#94A3B8] hover:text-[#E2E8F0] whitespace-nowrap">Profile</button>
              </>
            )}
          </div>
        </header>
      )}

      <main className="flex-1">
        <div className="animate-fade-in" key={currentView}>
          {renderView()}
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  )
}

export default function HomePage() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  )
}