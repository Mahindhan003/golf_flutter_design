import { useState, useCallback, useEffect } from 'react'
import type { ScreenName, NavEntry, ToastData, DialogData } from './types'
import { IconHome, IconTournament, IconProfile, IconSpinner } from './components'
import SignIn from './screens/SignIn'
import Home from './screens/Home'
import TournamentList from './screens/TournamentList'
import TournamentDetails from './screens/TournamentDetails'
import CourseDetails from './screens/CourseDetails'
import Profile from './screens/Profile'
import EditProfile from './screens/EditProfile'

/* ───────────────── Status Bar ───────────────── */

function StatusBar() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  })

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }, 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-between px-6 pt-12 pb-1.5 flex-shrink-0">
      <span className="text-pine-900 text-[15px] font-bold font-display tracking-tight">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill="#1a3a2a"/>
          <rect x="5" y="4.5" width="3" height="7.5" rx="0.6" fill="#1a3a2a"/>
          <rect x="10" y="2" width="3" height="10" rx="0.6" fill="#1a3a2a"/>
          <rect x="15" y="0" width="3" height="12" rx="0.6" fill="#1a3a2a"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="#1a3a2a"/>
          <path d="M4.5 6.5C5.65 5.4 6.75 5 8 5s2.35.4 3.5 1.5l1-1C11.1 4.1 9.6 3.5 8 3.5S4.9 4.1 3.5 5.5l1 1z" fill="#1a3a2a"/>
          <path d="M2 3.5C3.6 1.9 5.7 1 8 1s4.4.9 6 2.5l1-1C13 .9 10.6 0 8 0S3 .9 1 2.5l1 1z" fill="#1a3a2a" opacity="0.4"/>
        </svg>
        {/* Battery */}
        <div className="flex items-center">
          <div className="w-[25px] h-[12px] border-[1.3px] border-pine-800 rounded-[2.5px] relative p-[1.5px]">
            <div className="h-full bg-pine-800 rounded-[1px]" style={{ width: '72%' }}/>
          </div>
          <div className="w-[2px] h-[5px] bg-pine-800 rounded-r-sm ml-[1.5px] opacity-60"/>
        </div>
      </div>
    </div>
  )
}

/* ───────────────── Dynamic Island ───────────────── */

function DynamicIsland() {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
      <div className="w-[120px] h-[34px] bg-black rounded-full" />
    </div>
  )
}

/* ───────────────── Bottom Navigation ───────────────── */

interface BottomNavProps {
  activeTab: number
  onTabChange: (tab: number) => void
}

const NAV_TABS = [
  { label: 'Home', Icon: IconHome },
  { label: 'Tournaments', Icon: IconTournament },
  { label: 'Profile', Icon: IconProfile },
]

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="flex-shrink-0 bg-canvas px-5 pt-2">
      {/* Floating pill */}
      <div className="flex items-center gap-1 bg-ink rounded-full p-1.5 shadow-float">
        {NAV_TABS.map(({ label, Icon }, i) => {
          const isActive = activeTab === i
          return (
            <button
              key={i}
              onClick={() => onTabChange(i)}
              aria-label={label}
              className={`h-12 flex items-center justify-center gap-2 rounded-full transition-all duration-200 active:scale-95 ${
                isActive ? 'flex-[1.6] bg-lime-400 text-ink' : 'flex-1 text-white/55'
              }`}
            >
              <Icon active={isActive} />
              {isActive && (
                <span className="text-[13px] font-bold font-display tracking-tight">{label}</span>
              )}
            </button>
          )
        })}
      </div>
      {/* Home indicator */}
      <div className="flex justify-center pt-2.5 pb-2">
        <div className="w-32 h-1 bg-ink/25 rounded-full" />
      </div>
    </div>
  )
}

/* ───────────────── Toast ───────────────── */

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3200)
    return () => clearTimeout(id)
  }, [onDismiss])

  const dot: Record<ToastData['type'], string> = {
    success: 'bg-lime-400 text-ink',
    error:   'bg-rose-500 text-white',
    info:    'bg-white/20 text-white',
  }

  const icons: Record<ToastData['type'], string> = {
    success: '✓',
    error:   '✕',
    info:    'i',
  }

  return (
    <div
      className="absolute bottom-28 left-5 right-5 z-50 flex items-center gap-3 pl-2 pr-4 py-2 rounded-full shadow-float toast-in bg-ink text-white"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${dot[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button onClick={onDismiss} className="opacity-60 text-lg leading-none active:opacity-100">×</button>
    </div>
  )
}

/* ───────────────── Confirmation Dialog ───────────────── */

function Dialog({ dialog, onClose }: { dialog: DialogData; onClose: () => void }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-black/40 z-40 fade-in"
        onClick={onClose}
      />
      <div className="absolute inset-0 z-50 flex items-center justify-center px-8">
        <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-[310px] overflow-hidden fade-in-up p-6">
          <h3 className="font-display font-bold text-ink text-[19px] tracking-tight">{dialog.title}</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{dialog.message}</p>
          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={() => { dialog.onConfirm(); onClose() }}
              className={`h-12 rounded-full text-sm font-bold font-display transition-colors ${
                dialog.destructive ? 'bg-rose-600 text-white active:bg-rose-700' : 'bg-ink text-white active:bg-pine-900'
              }`}
            >
              {dialog.confirmLabel ?? 'Confirm'}
            </button>
            <button
              onClick={onClose}
              className="h-12 rounded-full text-sm font-semibold font-display text-gray-600 bg-canvas active:bg-gray-200 transition-colors"
            >
              {dialog.cancelLabel ?? 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ───────────────── Phone Frame (desktop wrapper) ───────────────── */

const PHONE_MAX_WIDTH = 500

/** True on phone-sized viewports, where the app fills the screen instead of drawing a device frame */
function useIsPhoneViewport() {
  const check = () => window.innerWidth <= PHONE_MAX_WIDTH
  const [isPhone, setIsPhone] = useState(check)
  useEffect(() => {
    // Device emulators can fire `resize` before layout settles, so re-check on the next frame too
    const onResize = () => {
      setIsPhone(check())
      requestAnimationFrame(() => setIsPhone(check()))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isPhone
}

function PhoneFrame({ children, bare }: { children: React.ReactNode; bare: boolean }) {
  if (bare) {
    return (
      <div className="relative w-full h-[100dvh] overflow-hidden bg-canvas">
        {children}
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #061410 0%, #0f2318 35%, #1a3a2a 70%, #0a1c12 100%)',
      }}
    >
      {/* Ambient orbs */}
      <div
        className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(74,146,100,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)' }}
      />

      {/* Wordmark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <p className="text-white/20 text-[11px] font-display font-semibold tracking-[0.2em] uppercase">
          Golf Tournament Platform
        </p>
      </div>

      {/* Device frame */}
      <div
        className="relative"
        style={{
          width: '390px',
          transform: 'scale(min(1, min(calc((100vh - 60px) / 860px), calc((100vw - 40px) / 400px))))',
          transformOrigin: 'center center',
        }}
      >
        {/* Outer bezel */}
        <div
          className="relative rounded-[52px] overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1c2620 0%, #0d1710 100%)',
            padding: '2px',
            boxShadow:
              '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Screen */}
          <div
            className="rounded-[50px] overflow-hidden bg-canvas relative"
            style={{ height: '844px' }}
          >
            {children}
          </div>
        </div>

        {/* Physical buttons */}
        <div className="absolute left-[-3px] top-[120px] w-[3px] h-[34px] bg-[#1c2620] rounded-l-sm" />
        <div className="absolute left-[-3px] top-[165px] w-[3px] h-[60px] bg-[#1c2620] rounded-l-sm" />
        <div className="absolute left-[-3px] top-[238px] w-[3px] h-[60px] bg-[#1c2620] rounded-l-sm" />
        <div className="absolute right-[-3px] top-[160px] w-[3px] h-[80px] bg-[#1c2620] rounded-r-sm" />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="text-white/15 text-[10px] font-display tracking-widest uppercase">Sprint 1 · UI Design</p>
      </div>
    </div>
  )
}

/* ───────────────── Loading Screen ───────────────── */

function LoadingScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-pine-800">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <IconSpinner />
      </div>
      <p className="text-pine-200 text-sm font-display font-medium">Loading…</p>
    </div>
  )
}

/* ───────────────── Session Expired Dialog ───────────────── */

function SessionExpiredModal({ onDismiss }: { onDismiss: () => void }) {
  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-40 fade-in" />
      <div className="absolute inset-0 z-50 flex items-center justify-center px-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[300px] overflow-hidden fade-in-up">
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="1.6"/>
                <path d="M12 7v5l3 2" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-pine-900 text-[17px]">Session Expired</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Your session has expired for security. Please sign in again to continue.
            </p>
          </div>
          <div className="border-t border-gray-100">
            <button
              onClick={onDismiss}
              className="w-full py-4 text-sm font-semibold text-pine-700 active:bg-pine-50 transition-colors font-display"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ───────────────── App Root ───────────────── */

const TAB_SCREENS: ScreenName[] = ['home', 'tournaments', 'profile']

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab]             = useState(0)
  const [navStack, setNavStack]               = useState<NavEntry[]>([{ screen: 'home', direction: 'push' }])
  const [toast, setToast]                     = useState<ToastData | null>(null)
  const [dialog, setDialog]                   = useState<DialogData | null>(null)
  const [sessionExpired, setSessionExpired]   = useState(false)
  const [isLoading]                           = useState(false)

  const currentRoute = navStack[navStack.length - 1]
  const canGoBack    = navStack.length > 1

  const push = useCallback((screen: ScreenName, params?: Record<string, string>) => {
    setNavStack(prev => [...prev, { screen, params, direction: 'push' }])
  }, [])

  const pop = useCallback(() => {
    setNavStack(prev => {
      if (prev.length <= 1) return prev
      const next = prev.slice(0, -1)
      return [...next.slice(0, -1), { ...next[next.length - 1], direction: 'pop' }]
    })
  }, [])

  const switchTab = useCallback((tab: number) => {
    setActiveTab(tab)
    setNavStack([{ screen: TAB_SCREENS[tab], direction: 'push' }])
  }, [])

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = Date.now().toString()
    setToast({ id, message, type })
  }, [])

  const showDialog = useCallback((d: DialogData) => setDialog(d), [])

  const handleSignIn = useCallback(() => {
    setIsAuthenticated(true)
    setNavStack([{ screen: 'home', direction: 'push' }])
    setActiveTab(0)
    showToast('Welcome back, Alexander', 'success')
  }, [showToast])

  const handleSignOut = useCallback(() => {
    showDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your Golf Tournament Platform account?',
      confirmLabel: 'Sign Out',
      cancelLabel: 'Stay',
      destructive: true,
      onConfirm: () => {
        setIsAuthenticated(false)
        setNavStack([{ screen: 'home', direction: 'push' }])
        setActiveTab(0)
        showToast('Signed out successfully', 'info')
      },
    })
  }, [showDialog, showToast])

  const handleSessionExpired = useCallback(() => {
    setSessionExpired(false)
    setIsAuthenticated(false)
    setNavStack([{ screen: 'home', direction: 'push' }])
  }, [])

  const sharedProps = { push, pop, showToast, showDialog, canGoBack }

  /* Derive active tab from current screen */
  useEffect(() => {
    const s = currentRoute.screen
    if (s === 'home') setActiveTab(0)
    else if (s === 'tournaments' || s === 'tournament-details' || s === 'course-details') setActiveTab(1)
    else if (s === 'profile' || s === 'edit-profile') setActiveTab(2)
  }, [currentRoute.screen])

  function renderScreen() {
    if (!isAuthenticated) {
      return <SignIn onSignIn={handleSignIn} showToast={showToast} />
    }

    if (isLoading) return <LoadingScreen />

    const animClass = currentRoute.direction === 'pop' ? 'screen-pop' : 'screen-push'

    const screenContent = (() => {
      switch (currentRoute.screen) {
        case 'home':
          return <Home {...sharedProps} />
        case 'tournaments':
          return <TournamentList {...sharedProps} />
        case 'tournament-details':
          return <TournamentDetails {...sharedProps} tournamentId={currentRoute.params?.id ?? 't1'} />
        case 'course-details':
          return <CourseDetails {...sharedProps} courseId={currentRoute.params?.id ?? 'c1'} />
        case 'profile':
          return <Profile {...sharedProps} onSignOut={handleSignOut} />
        case 'edit-profile':
          return <EditProfile {...sharedProps} />
        default:
          return <Home {...sharedProps} />
      }
    })()

    return (
      <div key={currentRoute.screen + JSON.stringify(currentRoute.params)} className={`h-full ${animClass}`}>
        {screenContent}
      </div>
    )
  }

  const showBottomNav = isAuthenticated && !isLoading
  const isPhone       = useIsPhoneViewport()

  return (
    <PhoneFrame bare={isPhone}>
      {!isPhone && <DynamicIsland />}
      <div className="flex flex-col h-full bg-canvas">
        {/* On a real phone the device draws its own status bar, so only keep the fake one in the desktop mockup */}
        {isPhone
          ? <div className="flex-shrink-0" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }} />
          : <StatusBar />}

        {/* Screen content */}
        <div className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </div>

        {/* Bottom nav */}
        {showBottomNav && (
          <BottomNav activeTab={activeTab} onTabChange={switchTab} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast key={toast.id} toast={toast} onDismiss={() => setToast(null)} />
      )}

      {/* Dialog */}
      {dialog && (
        <Dialog dialog={dialog} onClose={() => setDialog(null)} />
      )}

      {/* Session expired */}
      {sessionExpired && (
        <SessionExpiredModal onDismiss={handleSessionExpired} />
      )}
    </PhoneFrame>
  )
}
