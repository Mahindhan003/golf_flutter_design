import { useState, useEffect } from 'react'
import type { SharedNavProps } from '../types'
import {
  Button, StatusBadge, GlassChip, InfoTile, SpotsBar, RoundButton, SkeletonRow, ErrorState,
  IconBack, IconCalendar, IconPin, IconClock, IconCourse, IconUsers, IconCheckCircle,
} from '../components'
import { getTournament } from '../data'

interface TournamentDetailsProps extends SharedNavProps {
  tournamentId: string
}

export default function TournamentDetails({ tournamentId, push, pop, showToast, showDialog }: TournamentDetailsProps) {
  const [loading, setLoading]       = useState(true)
  const [registered, setRegistered] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  const tournament = getTournament(tournamentId)

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(false)
      if (tournament?.registrationStatus === 'registered') setRegistered(true)
    }, 800)
    return () => clearTimeout(id)
  }, [tournament])

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-canvas relative">
        <div className="h-72 skeleton flex-shrink-0" />
        <div className="absolute top-3 left-4 z-10">
          <RoundButton onClick={pop} tone="glass" label="Back"><IconBack /></RoundButton>
        </div>
        <div className="flex-1 -mt-8 bg-white rounded-t-[32px] px-5 pt-6 space-y-4 relative">
          <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="h-full flex flex-col bg-canvas">
        <div className="px-5 pt-3">
          <RoundButton onClick={pop} label="Back"><IconBack /></RoundButton>
        </div>
        <ErrorState
          title="Tournament not found"
          message="This tournament may have been removed or the link is invalid."
          onRetry={pop}
        />
      </div>
    )
  }

  const { name, dateRange, time, venue, location, format, category, description,
          status, registrationStatus, players, maxPlayers, entryFee, prize, courseId, imageUrl } = tournament

  const spotsLeft = maxPlayers - players

  const isCancelled  = status === 'cancelled'
  const isCompleted  = status === 'completed'
  const isRegistered = registered || registrationStatus === 'registered'
  const isOpen       = registrationStatus === 'open' && !isCancelled && !isCompleted
  const isComingSoon = registrationStatus === 'coming-soon'
  const isClosed     = registrationStatus === 'closed' && !isCancelled && !isCompleted

  const badgeStatus =
    isCancelled    ? 'cancelled'
    : isCompleted  ? 'completed'
    : isRegistered ? 'registered'
    : isOpen       ? 'open'
    : isComingSoon ? 'coming-soon'
    : 'closed'

  function handleRegister() {
    if (isRegistered) {
      showDialog({
        title: 'Cancel Registration',
        message: 'Are you sure you want to cancel your registration for this tournament?',
        confirmLabel: 'Cancel Registration',
        cancelLabel: 'Keep Spot',
        destructive: true,
        onConfirm: () => {
          setRegistered(false)
          showToast('Registration cancelled', 'info')
        },
      })
      return
    }

    setRegLoading(true)
    setTimeout(() => {
      setRegLoading(false)
      setRegistered(true)
      showToast(`You're registered for ${name}!`, 'success')
    }, 1800)
  }

  return (
    <div className="h-full flex flex-col bg-canvas relative">
      {/* Floating back button — stays put while the page scrolls */}
      <div className="absolute top-3 left-4 z-10">
        <RoundButton onClick={pop} tone="glass" label="Back"><IconBack /></RoundButton>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
        {/* Hero image */}
        <div className="relative h-72 bg-pine-100">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 scrim-top" />
          <div className="absolute inset-0 scrim-bottom" />

          {prize && !isCancelled && (
            <div className="absolute top-3 right-4 rounded-2xl px-3 py-2 max-w-[200px] shadow-md" style={{ background: 'rgba(201,162,39,0.95)' }}>
              <p className="text-[10px] text-ink/60 font-bold font-display uppercase tracking-wider leading-none">Prize</p>
              <p className="text-[12px] text-ink font-bold font-display leading-tight mt-1">{prize}</p>
            </div>
          )}

          <div className="absolute bottom-12 left-5 right-5 flex items-center gap-2 flex-wrap">
            <StatusBadge status={badgeStatus} size="md" onImage />
            <GlassChip>{format}</GlassChip>
          </div>
        </div>

        {/* Content sheet, overlapping the hero */}
        <div className="relative -mt-8 bg-white rounded-t-[32px] px-5 pt-6 pb-8">
          <p className="text-[12px] font-bold text-pine-500 font-display">{category}</p>
          <h1 className="font-display font-extrabold text-ink text-[26px] leading-[1.15] tracking-tight mt-1">{name}</h1>

          <div className="flex items-center gap-1.5 mt-2.5">
            <IconPin />
            <span className="text-[13px] text-gray-500">{venue} · {location}</span>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <InfoTile icon={<IconCalendar />} label="Date" value={dateRange} />
            <InfoTile icon={<IconClock />} label="Tee time" value={time} />
            <InfoTile
              icon={
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="1" y="1" width="13" height="13" rx="3" stroke="#4a9264" strokeWidth="1.2"/>
                  <path d="M1 5.5h13M5.5 1v4.5" stroke="#4a9264" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
              label="Format"
              value={format}
            />
            <InfoTile icon={<IconUsers />} label="Entry fee" value={entryFee} />
          </div>

          {/* Registration */}
          {!isCancelled && !isCompleted && (
            <div className="mt-6">
              <h2 className="font-display font-bold text-ink text-[17px] tracking-tight mb-3">Registration</h2>

              {isRegistered && (
                <div className="flex items-center gap-3 bg-lime-300/50 rounded-2xl px-4 py-3.5 mb-3">
                  <IconCheckCircle />
                  <div>
                    <p className="text-sm font-bold text-ink font-display">You're registered!</p>
                    <p className="text-xs text-pine-700 mt-0.5">Your spot is confirmed for this tournament.</p>
                  </div>
                </div>
              )}

              {isOpen && (
                <div className="bg-canvas rounded-2xl p-4">
                  <SpotsBar players={players} maxPlayers={maxPlayers} />
                </div>
              )}

              {isClosed && (
                <Notice tone="rose" title="Registration closed" body="The registration period for this tournament has ended." />
              )}

              {isComingSoon && (
                <Notice tone="amber" title="Registration opening soon" body="Registration details will be announced shortly." />
              )}
            </div>
          )}

          {isCancelled && (
            <div className="mt-6">
              <Notice
                tone="rose"
                title="Tournament cancelled"
                body="This tournament has been cancelled. If you were registered, you will receive a full refund within 5–7 business days."
              />
            </div>
          )}

          {isCompleted && (
            <div className="mt-6">
              <Notice tone="gray" title="Tournament completed" body="This tournament has concluded. Results and leaderboards are archived." />
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h2 className="font-display font-bold text-ink text-[17px] tracking-tight mb-2">About</h2>
            <p className={`text-[14px] leading-relaxed ${isCancelled ? 'text-rose-600' : 'text-gray-500'}`}>{description}</p>
          </div>
        </div>
      </div>

      {/* Action bar — in normal flow at the bottom of the screen */}
      {!isCancelled && (
        <div className="flex-shrink-0 bg-white px-5 pt-3 pb-3 border-t border-black/[0.05]">
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              onClick={() => push('course-details', { id: courseId })}
              className="flex-shrink-0"
            >
              <IconCourse />
              <span>Course</span>
            </Button>

            {isCompleted ? (
              <Button variant="ghost" disabled fullWidth>
                Tournament ended
              </Button>
            ) : isClosed ? (
              <Button variant="ghost" disabled fullWidth>
                Registration closed
              </Button>
            ) : isComingSoon ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => showToast("You'll be notified when registration opens", 'success')}
              >
                Notify me
              </Button>
            ) : isRegistered ? (
              <Button variant="danger" fullWidth onClick={handleRegister} loading={regLoading}>
                Cancel registration
              </Button>
            ) : spotsLeft === 0 ? (
              <Button variant="ghost" disabled fullWidth>
                Fully booked
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={handleRegister} loading={regLoading}>
                {regLoading ? 'Registering…' : 'Register now'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Notice({ tone, title, body }: { tone: 'rose' | 'amber' | 'gray'; title: string; body: string }) {
  const tones = {
    rose:  'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    gray:  'bg-canvas text-gray-700',
  }
  return (
    <div className={`rounded-2xl px-4 py-3.5 ${tones[tone]}`}>
      <p className="text-sm font-bold font-display">{title}</p>
      <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{body}</p>
    </div>
  )
}
