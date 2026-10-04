import { useEffect, useState } from 'react'
import type { SharedNavProps } from '../types'
import { Button, ErrorState, RoundButton, StatusBadge, IconBack } from '../components'
import { getTournament, getCourse } from '../data'
import { cardFor, leaderboard, myEntry, roundHoles, simulateTick, useLiveVersion } from '../live'
import { toPar } from '../golf'

interface LeaderboardProps extends SharedNavProps {
  tournamentId: string
}

/** Score cell colour like a TV graphic: birdie or better circled lime, bogey or worse boxed. */
export function ScoreCell({ strokes, par }: { strokes: number | null; par: number }) {
  if (strokes === null) return <span className="text-gray-300">·</span>
  const d = strokes - par
  const shape = d <= -2 ? 'rounded-full bg-amber-300 ring-2 ring-amber-400' : d === -1 ? 'rounded-full bg-lime-400' : d === 1 ? 'rounded-md ring-1 ring-black/25' : d >= 2 ? 'rounded-md bg-ink text-white' : ''
  return <span className={`inline-flex w-6 h-6 items-center justify-center text-[12px] font-bold ${shape}`}>{strokes}</span>
}

const toParClass = (n: number) => (n < 0 ? 'text-rose-600' : 'text-ink')

export default function Leaderboard({ tournamentId, pop, push }: LeaderboardProps) {
  useLiveVersion()
  const t = getTournament(tournamentId)
  const [round, setRound] = useState(1)
  const [division, setDivision] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [updated, setUpdated] = useState(() => new Date())

  // Live: poll for new scores (a real app gets them pushed)
  useEffect(() => {
    if (t?.status !== 'in-progress') return
    const timer = setInterval(() => { simulateTick(t, round); setUpdated(new Date()) }, 8000)
    return () => clearInterval(timer)
  }, [t, round])

  if (!t) {
    return (
      <div className="h-full flex flex-col bg-canvas">
        <div className="px-5 pt-3"><RoundButton onClick={pop} label="Back"><IconBack /></RoundButton></div>
        <ErrorState title="Leaderboard unavailable" message="This tournament could not be found." onRetry={pop} />
      </div>
    )
  }

  const course = getCourse(t.courseId)
  const holes = course ? roundHoles(t, course, round) : []
  const rows = leaderboard(t, round, division || undefined)
  const stableford = t.format === 'Stableford'
  const useNet = !stableford && t.scoring?.basis === 'net'
  const live = t.status === 'in-progress'
  const me = myEntry(t.id)
  const started = rows.some(r => r.thru > 0)

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <RoundButton onClick={pop} label="Back"><IconBack /></RoundButton>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-gray-500 font-semibold truncate">{t.name}</p>
            <h1 className="font-display font-extrabold text-ink text-[22px] leading-tight tracking-tight">{live ? 'Live leaderboard' : t.status === 'completed' ? 'Results' : 'Leaderboard'}</h1>
          </div>
          {live && <StatusBadge status="in-progress" />}
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-4 -mx-5 px-5">
          {(t.rounds ?? [{ number: 1 }]).map(r => (
            <button key={r.number} onClick={() => setRound(r.number)} aria-pressed={round === r.number}
              className={`h-8 px-3.5 rounded-full text-[12px] font-bold font-display flex-shrink-0 ${round === r.number ? 'bg-ink text-white' : 'bg-white text-gray-600 shadow-card'}`}>
              R{r.number}
            </button>
          ))}
          {[{ id: '', name: 'All' }, ...(t.divisions ?? [])].map(d => (
            <button key={d.id} onClick={() => setDivision(d.id)} aria-pressed={division === d.id}
              className={`h-8 px-3.5 rounded-full text-[12px] font-bold font-display flex-shrink-0 whitespace-nowrap ${division === d.id ? 'bg-lime-400 text-ink' : 'bg-white text-gray-600 shadow-card'}`}>
              {d.name.replace(/\s*\(.*\)/, '')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-5 pb-5">
        {!started ? (
          <div className="bg-white rounded-3xl shadow-card p-6 text-center">
            <p className="font-display font-bold text-ink">No scores yet</p>
            <p className="text-[13px] text-gray-500 mt-1">Round {round} hasn't started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_52px_44px] gap-2 px-4 py-2.5 text-[11px] font-bold font-display text-gray-400 border-b border-black/[0.05]">
              <span>Pos</span><span>Player</span><span className="text-right">{stableford ? 'Pts' : useNet ? 'Net' : 'Score'}</span><span className="text-right">Thru</span>
            </div>
            {rows.map(row => {
              const score = stableford ? String(row.points) : toPar(useNet ? row.netToPar : row.grossToPar)
              const scoreNum = stableford ? 0 : useNet ? row.netToPar : row.grossToPar
              const isOpen = open === row.entry.id
              const card = isOpen ? cardFor(t, row.entry.id, round) : []
              return (
                <div key={row.entry.id} className={`border-b border-black/[0.04] last:border-b-0 ${row.entry.isMe ? 'bg-lime-300/40' : ''}`}>
                  <button onClick={() => setOpen(isOpen ? null : row.entry.id)} className="w-full grid grid-cols-[40px_1fr_52px_44px] gap-2 items-center px-4 py-3 text-left active:bg-canvas">
                    <span className="font-display font-extrabold text-ink text-[14px]">{row.position}</span>
                    <span className="min-w-0">
                      <span className="block font-display font-bold text-ink text-[14px] truncate">{row.entry.name}{row.entry.isMe && ' (you)'}</span>
                      <span className="block text-[11px] text-gray-500">HCP {row.entry.handicapIndex.toFixed(1)}{!stableford && t.scoring?.basis === 'gross-and-net' ? ` · net ${toPar(row.netToPar)}` : ''}</span>
                    </span>
                    <span className={`text-right font-display font-extrabold text-[16px] ${stableford ? 'text-ink' : toParClass(scoreNum)}`}>{score}</span>
                    <span className="text-right text-[13px] font-semibold text-gray-500">{row.thru === row.holes ? 'F' : row.thru}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
                      <div className="flex gap-1 min-w-max">
                        {holes.map((h, i) => (
                          <div key={h.hole} className="flex flex-col items-center gap-0.5 w-7">
                            <span className="text-[9px] font-bold text-gray-400">{h.hole}</span>
                            <ScoreCell strokes={card[i]} par={h.par} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <p className="text-[11px] text-gray-400 mt-3 px-1">
          {live ? `Updated ${updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · refreshes automatically` : 'Final unless marked provisional'} · tap a player for their card
        </p>
      </div>

      {live && me?.status === 'registered' && (
        <div className="flex-shrink-0 bg-white px-5 pt-3 pb-3 border-t border-black/[0.05]">
          <Button fullWidth onClick={() => push('live-play', { id: t.id })}>Enter my scores</Button>
        </div>
      )}
    </div>
  )
}
