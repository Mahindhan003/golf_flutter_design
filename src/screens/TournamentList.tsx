import { useState, useEffect, useMemo } from 'react'
import type { SharedNavProps, TournamentStatus } from '../types'
import {
  SearchInput, TournamentCard, SkeletonCard, Button,
  EmptyState, ErrorState,
} from '../components'
import { MOCK_TOURNAMENTS } from '../data'

type Filter = 'All' | 'Open' | 'Upcoming' | 'Completed' | 'Cancelled'

const FILTERS: Filter[] = ['All', 'Open', 'Upcoming', 'Completed', 'Cancelled']

const FILTER_STATUS: Record<Filter, TournamentStatus[]> = {
  All:       [],
  Open:      ['registration-open'],
  Upcoming:  ['upcoming', 'published'],
  Completed: ['completed'],
  Cancelled: ['cancelled'],
}

function countFor(filter: Filter) {
  return filter === 'All'
    ? MOCK_TOURNAMENTS.length
    : MOCK_TOURNAMENTS.filter(t => FILTER_STATUS[filter].includes(t.status)).length
}

/* ───────── Filter bottom sheet ───────── */

function FilterSheet({ value, onApply, onClose }: {
  value: Filter
  onApply: (f: Filter) => void
  onClose: () => void
}) {
  // Selection is only committed when the user taps "Show results"
  const [draft, setDraft] = useState<Filter>(value)
  const count = countFor(draft)

  return (
    <>
      <div className="absolute inset-0 z-30 bg-black/40 fade-in" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 z-40 bg-white rounded-t-[32px] px-5 pt-3 pb-5 sheet-up">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-extrabold text-ink text-[20px] tracking-tight">Filters</h2>
          <button
            onClick={() => setDraft('All')}
            className="text-[13px] font-semibold font-display text-gray-500 active:opacity-60"
          >
            Reset
          </button>
        </div>

        <p className="text-[13px] font-bold text-gray-500 font-display mb-2">Status</p>
        <div className="bg-canvas rounded-3xl p-1.5 space-y-1">
          {FILTERS.map(f => {
            const selected = draft === f
            return (
              <button
                key={f}
                onClick={() => setDraft(f)}
                className={`w-full flex items-center gap-3 h-12 px-4 rounded-2xl transition-all ${
                  selected ? 'bg-white shadow-card' : 'active:bg-white/60'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <path d="M6 4l4 4-4 4" stroke={selected ? '#0c1a12' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="flex-1 text-left text-[15px] font-semibold font-display text-ink">
                  {f === 'All' ? 'All tournaments' : f}
                </span>
                <span className="text-[12px] font-semibold text-gray-400">{countFor(f)}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  selected ? 'bg-ink' : 'border-2 border-black/15'
                }`}>
                  {selected && <span className="w-2 h-2 rounded-full bg-lime-400" />}
                </span>
              </button>
            )
          })}
        </div>

        <Button fullWidth className="mt-5" onClick={() => onApply(draft)}>
          Show {count} result{count !== 1 ? 's' : ''}
        </Button>
      </div>
    </>
  )
}

type ScreenState = 'loading' | 'loaded' | 'error' | 'offline'

export default function TournamentList({ push }: SharedNavProps) {
  const [screenState, setScreenState] = useState<ScreenState>('loading')
  const [search, setSearch]           = useState('')
  const [activeFilter, setFilter]     = useState<Filter>('All')
  const [sheetOpen, setSheetOpen]     = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setScreenState('loaded'), 1100)
    return () => clearTimeout(id)
  }, [])

  const filtered = useMemo(() => {
    let list = MOCK_TOURNAMENTS
    if (activeFilter !== 'All') {
      list = list.filter(t => FILTER_STATUS[activeFilter].includes(t.status))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.venue.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.format.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, activeFilter])

  return (
    <div className="h-full flex flex-col bg-canvas relative">
      {/* App bar */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div>
            <p className="text-[13px] text-gray-500 font-medium">Find your next event</p>
            <h1 className="font-display font-extrabold text-ink text-[28px] leading-tight tracking-tight">Tournaments</h1>
          </div>
          <button
            onClick={() => setSheetOpen(true)}
            aria-label="Filters"
            className="relative w-11 h-11 flex items-center justify-center rounded-full bg-ink active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5.5h15M5.5 10h9M8 14.5h4" stroke="#c8ec5a" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            {activeFilter !== 'All' && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-lime-400 ring-2 ring-canvas" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-3">
          <SearchInput value={search} onChange={setSearch} />
        </div>

        {/* Active filter pill — tap × to clear */}
        {activeFilter !== 'All' && (
          <div className="px-5 pb-2">
            <button
              onClick={() => setFilter('All')}
              className="inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-full bg-ink text-white text-[12px] font-semibold font-display active:scale-95 transition-all"
            >
              {activeFilter}
              <span className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center text-[10px] leading-none">✕</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll">
        {screenState === 'loading' && (
          <div className="px-5 pt-5 pb-6 space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {screenState === 'error' && (
          <ErrorState
            title="Failed to load tournaments"
            message="Check your connection and try again."
            onRetry={() => {
              setScreenState('loading')
              setTimeout(() => setScreenState('loaded'), 1200)
            }}
          />
        )}

        {screenState === 'offline' && (
          <div>
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#d97706" strokeWidth="1.3"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <p className="text-xs font-medium text-amber-700">Offline — showing cached results</p>
            </div>
            <div className="px-5 pt-4 pb-6 space-y-4">
              {filtered.slice(0, 3).map(t => (
                <TournamentCard key={t.id} tournament={t} onPress={() => push('tournament-details', { id: t.id })} />
              ))}
            </div>
          </div>
        )}

        {screenState === 'loaded' && (
          <>
            {filtered.length === 0 && search ? (
              <EmptyState
                title="No results found"
                subtitle={`No tournaments match "${search}". Try different keywords or clear your search.`}
                action={{ label: 'Clear search', onClick: () => setSearch('') }}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={`No ${activeFilter.toLowerCase()} tournaments`}
                subtitle="There are no tournaments in this category right now. Check back soon."
                action={{ label: 'View all', onClick: () => setFilter('All') }}
              />
            ) : (
              <div className="px-5 pt-2 pb-8 space-y-4">
                {/* Results count */}
                <p className="text-[12px] text-gray-500 font-semibold font-display">
                  {filtered.length} tournament{filtered.length !== 1 ? 's' : ''}
                  {search ? ` · "${search}"` : ''}
                </p>
                {filtered.map(t => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    onPress={() => push('tournament-details', { id: t.id })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {sheetOpen && (
        <FilterSheet
          value={activeFilter}
          onApply={f => { setFilter(f); setSheetOpen(false) }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}
