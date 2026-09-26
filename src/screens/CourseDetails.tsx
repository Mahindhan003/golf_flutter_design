import { useState, useEffect } from 'react'
import type { SharedNavProps } from '../types'
import {
  Button, InfoRow, SkeletonRow, ErrorState, RoundButton,
  IconBack, IconPin, TournamentCard, SectionHeader,
} from '../components'
import { getCourse, getTournamentsByCourse } from '../data'

interface CourseDetailsProps extends SharedNavProps {
  courseId: string
}

export default function CourseDetails({ courseId, push, pop, showToast }: CourseDetailsProps) {
  const [loading, setLoading]  = useState(true)
  const [showAll, setShowAll]  = useState(false)

  const course      = getCourse(courseId)
  const tournaments = getTournamentsByCourse(courseId)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 750)
    return () => clearTimeout(id)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-canvas relative">
        <div className="h-64 skeleton flex-shrink-0" />
        <div className="absolute top-3 left-4 z-10">
          <RoundButton onClick={pop} tone="glass" label="Back"><IconBack /></RoundButton>
        </div>
        <div className="flex-1 -mt-8 bg-white rounded-t-[32px] px-5 pt-6 space-y-4 relative">
          {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col bg-canvas">
        <div className="px-5 pt-3">
          <RoundButton onClick={pop} label="Back"><IconBack /></RoundButton>
        </div>
        <ErrorState title="Course not found" message="This course could not be loaded." onRetry={pop} />
      </div>
    )
  }

  const frontNine = course.holeData.slice(0, 9)
  const backNine  = course.holeData.slice(9, 18)
  const displayHoles = showAll ? course.holeData : frontNine

  const frontPar = frontNine.reduce((s, h) => s + h.par, 0)
  const frontYds = frontNine.reduce((s, h) => s + h.yards, 0)

  const stats: [string | number, string][] = [
    [course.holes, 'Holes'],
    [course.par, 'Par'],
    [course.yardage.toLocaleString(), 'Yards'],
    [course.rating.toFixed(1), 'Rating'],
    [course.slope, 'Slope'],
    [course.established, 'Est.'],
  ]

  const cols = { gridTemplateColumns: '44px 1fr 1fr 1fr' }

  return (
    <div className="h-full flex flex-col bg-canvas relative">
      <div className="absolute top-3 left-4 z-10">
        <RoundButton onClick={pop} tone="glass" label="Back"><IconBack /></RoundButton>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
        {/* Hero */}
        <div className="relative h-64 bg-pine-100">
          <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 scrim-top" />
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute bottom-12 left-5 right-5">
            <div className="flex items-center gap-1.5 mb-1">
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1.5a4 4 0 014 4c0 2.8-4 8.5-4 8.5S3.5 8.3 3.5 5.5a4 4 0 014-4z" stroke="#c8ec5a" strokeWidth="1.3"/>
                <circle cx="7.5" cy="5.5" r="1.5" stroke="#c8ec5a" strokeWidth="1.3"/>
              </svg>
              <span className="text-[12px] text-white/80 font-semibold font-display">{course.city}, {course.region}</span>
            </div>
            <h1 className="font-display font-extrabold text-white text-[24px] leading-tight tracking-tight">{course.name}</h1>
          </div>
        </div>

        {/* Content sheet */}
        <div className="relative -mt-8 bg-white rounded-t-[32px] px-5 pt-6 pb-8 space-y-7">

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(([value, label], i) => (
              <div key={label} className={`rounded-2xl p-3 ${i === 0 ? 'bg-lime-400' : 'bg-canvas'}`}>
                <p className="font-display font-extrabold text-[19px] tracking-tight text-ink leading-none">{value}</p>
                <p className={`text-[11px] font-semibold mt-1.5 ${i === 0 ? 'text-pine-800' : 'text-gray-500'}`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <InfoRow
              icon={<IconPin />}
              label="Address"
              value={`${course.address}, ${course.city}, ${course.region}`}
            />
            <InfoRow
              icon={
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 7.5l4 4 7-7" stroke="#4a9264" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              label="Designer"
              value={course.designer}
            />
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display font-bold text-ink text-[17px] tracking-tight mb-2">About the course</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">{course.description}</p>
          </div>

          {/* Scorecard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-ink text-[17px] tracking-tight">Scorecard</h2>
              {course.holes === 18 && backNine.length > 0 && (
                <div className="flex bg-canvas rounded-full p-1">
                  {(['Front 9', 'All 18'] as const).map((label, i) => {
                    const active = showAll === (i === 1)
                    return (
                      <button
                        key={label}
                        onClick={() => setShowAll(i === 1)}
                        className={`h-7 px-3 rounded-full text-[12px] font-bold font-display transition-all ${
                          active ? 'bg-ink text-white' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden bg-canvas p-1">
              <div className="grid text-center" style={cols}>
                {['Hole', 'Par', 'Yds', 'Hcp'].map(h => (
                  <div key={h} className="py-2 text-[11px] font-bold font-display text-gray-400">{h}</div>
                ))}
              </div>

              <div className="bg-white rounded-xl overflow-hidden">
                {displayHoles.map(h => (
                  <div key={h.hole} className="grid text-center border-b border-black/[0.04] last:border-b-0" style={cols}>
                    <div className="py-2.5 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-canvas text-[11px] font-bold font-display text-ink flex items-center justify-center">
                        {h.hole}
                      </span>
                    </div>
                    <div className="py-2.5 text-[13px] font-semibold text-ink">{h.par}</div>
                    <div className="py-2.5 text-[13px] text-gray-600">{h.yards}</div>
                    <div className="py-2.5 text-[13px] text-gray-400">{h.handicap}</div>
                  </div>
                ))}
              </div>

              <div className="grid text-center" style={cols}>
                <div className="py-2.5 text-[11px] font-bold font-display text-ink">OUT</div>
                <div className="py-2.5 text-[13px] font-bold text-ink">{frontPar}</div>
                <div className="py-2.5 text-[13px] font-bold text-ink">{frontYds}</div>
                <div className="py-2.5 text-[13px] text-gray-400">—</div>
              </div>
            </div>
          </div>

          {/* Related tournaments */}
          {tournaments.length > 0 && (
            <div>
              <SectionHeader title="Tournaments here" />
              <div className="space-y-3">
                {tournaments.slice(0, 2).map(t => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    onPress={() => push('tournament-details', { id: t.id })}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer action — in normal flow */}
      <div className="flex-shrink-0 bg-white px-5 pt-3 pb-3 border-t border-black/[0.05]">
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            if (tournaments.length > 0) {
              push('tournament-details', { id: tournaments[0].id })
            } else {
              showToast('No active tournaments at this course', 'info')
            }
          }}
        >
          {tournaments.some(t => t.registrationStatus === 'open')
            ? 'View open tournament'
            : 'View tournaments'}
        </Button>
      </div>
    </div>
  )
}
