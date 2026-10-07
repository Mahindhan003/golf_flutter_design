# golf_flutter_design

Clickable UX prototype of the **golfer mobile app** (React + Vite + Tailwind, drawn in a phone frame).
The mobile app is for golfers only. Admin and organiser tools are in the web prototype (`UX/web`).

```bash
npm install
npx vite
```

Sign in with any email and a password of 4+ characters. **Sign up** creates a golfer account: login details → verify email with a 6-digit code (the prototype shows the code, `246810`) or verify later → about you → your game → preferences. Rules are shared with the web prototype in `src/account-rules.ts`. Use `wrongpass` to see the wrong-password error and `serverdown` to see the server error.

## Screens

| Screen | What the golfer can do |
| --- | --- |
| Home | Handicap card. **Playing now** card on tournament day (position, to par, thru, then continue scoring). Up next, open events |
| Tournaments | Search, plus a status filter (Live, Open, Upcoming, Completed, Cancelled) |
| Tournament details | Format, entry and fees, registration window, schedule, scoring, divisions, prizes, local rules, contacts. Register (choosing a division), join the waitlist, or withdraw. On tournament day: tee time, playing partners, leaderboard, enter scores |
| Leaderboard | Live (auto-refreshing) or final results, by round and division. Gross, net or Stableford. Tap a player to see their hole-by-hole card |
| Live play | Full-screen on-course mode. Front/centre/back of the green, reach and carry for the next hazard, a hole map (tap to measure, mark ball, "GPS my ball"), a score stepper with strokes received, and the scorecard sheet. Submit card |
| Course details | Stats, status banner (closed or maintenance), dress code, directions/call/website, scorecard, tees with rating/slope, hole guide with maps, facilities |
| Profile / Edit profile | Golfer details and handicap |

## Prototype data

- `src/data.ts` holds the static tournaments and courses. `t8` is a live tournament, today's club championship.
- `src/live.ts` holds tournament-day state: field entries, tee groups, scorecards, marked shots and the leaderboard. It's saved to `localStorage` (`gtp-live-v1`), and `simulateTick` moves the rest of the field along. A real backend would push these updates.
- `src/golf.ts` holds the golf maths: playing handicap (WHS), strokes per hole, Stableford points and hole-map generation.
- `src/hole-map.tsx` draws the hole maps. Positions are yards on a local grid; the backend would store latitude/longitude.

`golf.ts` and `hole-map.tsx` are copies of the web prototype's files. `live.ts` is the web copy without the admin store. Keep them in step with the web prototype.
