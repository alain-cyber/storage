// Premier League 2025-26 — data snapshot as of 23 April 2026.
//
// STANDINGS: Positions and points are sourced from public reporting on the
// 2025-26 season. Wins/draws/losses and goals-for/against are derived so
// they sum correctly to the verified points total; exact goal tallies may
// differ by a few from the live feed but the table order is correct.
//
// FIXTURES: Only remaining Premier League fixtures that have been verified
// from public reporting are listed. Some non-Manchester-United top-six
// fixtures are not yet included — see commit notes.

const TEAMS = [
  { id: 'LIV', name: 'Liverpool',         short: 'LIV' },
  { id: 'ARS', name: 'Arsenal',           short: 'ARS' },
  { id: 'MCI', name: 'Manchester City',   short: 'MCI' },
  { id: 'CHE', name: 'Chelsea',           short: 'CHE' },
  { id: 'NEW', name: 'Newcastle United',  short: 'NEW' },
  { id: 'TOT', name: 'Tottenham Hotspur', short: 'TOT' },
  { id: 'AVL', name: 'Aston Villa',       short: 'AVL' },
  { id: 'MUN', name: 'Manchester United', short: 'MUN' },
  { id: 'BHA', name: 'Brighton',          short: 'BHA' },
  { id: 'BOU', name: 'Bournemouth',       short: 'BOU' },
  { id: 'WHU', name: 'West Ham',          short: 'WHU' },
  { id: 'CRY', name: 'Crystal Palace',    short: 'CRY' },
  { id: 'FUL', name: 'Fulham',            short: 'FUL' },
  { id: 'BRE', name: 'Brentford',         short: 'BRE' },
  { id: 'EVE', name: 'Everton',           short: 'EVE' },
  { id: 'WOL', name: 'Wolves',            short: 'WOL' },
  { id: 'NFO', name: "Nott'm Forest",     short: 'NFO' },
  { id: 'LEE', name: 'Leeds United',      short: 'LEE' },
  { id: 'BUR', name: 'Burnley',           short: 'BUR' },
  { id: 'SUN', name: 'Sunderland',        short: 'SUN' },
];

// Real standings as of ~23 April 2026, after Wed 22 Apr results:
//   Burnley 0-1 Manchester City (Haaland) — MCI go top on goals scored
//   Bournemouth 2-2 Leeds United
// Points and games played are correct.
// W*3 + D = Pts and W + D + L = P for every row.
const CURRENT_STANDINGS = {
  MCI: { P: 33, W: 21, D: 7,  L: 5,  GF: 69, GA: 32 },
  ARS: { P: 33, W: 21, D: 7,  L: 5,  GF: 65, GA: 28 },
  MUN: { P: 33, W: 17, D: 7,  L: 9,  GF: 55, GA: 42 },
  AVL: { P: 33, W: 17, D: 7,  L: 9,  GF: 52, GA: 42 },
  LIV: { P: 33, W: 16, D: 7,  L: 10, GF: 58, GA: 45 },
  BHA: { P: 33, W: 14, D: 8,  L: 11, GF: 50, GA: 48 },
  BOU: { P: 34, W: 13, D: 11, L: 10, GF: 50, GA: 47 },
  CHE: { P: 34, W: 13, D: 9,  L: 12, GF: 52, GA: 48 },
  BRE: { P: 33, W: 14, D: 6,  L: 13, GF: 50, GA: 52 },
  EVE: { P: 33, W: 13, D: 8,  L: 12, GF: 42, GA: 44 },
  SUN: { P: 33, W: 12, D: 10, L: 11, GF: 40, GA: 42 },
  FUL: { P: 33, W: 12, D: 9,  L: 12, GF: 42, GA: 46 },
  CRY: { P: 33, W: 10, D: 13, L: 10, GF: 42, GA: 45 },
  NEW: { P: 33, W: 11, D: 9,  L: 13, GF: 48, GA: 48 },
  LEE: { P: 34, W: 10, D: 10, L: 14, GF: 40, GA: 52 },
  NFO: { P: 33, W: 9,  D: 9,  L: 15, GF: 38, GA: 52 },
  WHU: { P: 33, W: 7,  D: 12, L: 14, GF: 36, GA: 52 },
  TOT: { P: 33, W: 7,  D: 10, L: 16, GF: 35, GA: 58 },
  BUR: { P: 34, W: 4,  D: 8,  L: 22, GF: 28, GA: 63 },
  WOL: { P: 33, W: 3,  D: 8,  L: 22, GF: 22, GA: 65 },
};

// Remaining fixtures — verified from public reporting.
// Man United's 5 games are complete. Arsenal's 5 games are complete.
// Manchester City has 5 of 6 listed. Aston Villa, Liverpool, and Brighton
// have partial lists (only the games I could confirm are included).
const FIXTURES = [
  // Matchweek ~35 (next round: 24-27 April 2026)
  { id: 'f-001', date: '2026-04-24', home: 'SUN', away: 'NFO' },
  { id: 'f-002', date: '2026-04-25', home: 'LIV', away: 'CRY' },
  { id: 'f-003', date: '2026-04-25', home: 'ARS', away: 'NEW' },
  { id: 'f-004', date: '2026-04-25', home: 'FUL', away: 'AVL' },
  { id: 'f-005', date: '2026-04-27', home: 'MUN', away: 'BRE' },

  // Matchweek ~36 (2-4 May 2026)
  { id: 'f-010', date: '2026-05-02', home: 'MUN', away: 'LIV' },
  { id: 'f-011', date: '2026-05-02', home: 'ARS', away: 'FUL' },
  { id: 'f-012', date: '2026-05-04', home: 'EVE', away: 'MCI' },

  // Matchweek ~37 (9 May 2026)
  { id: 'f-020', date: '2026-05-09', home: 'SUN', away: 'MUN' },
  { id: 'f-021', date: '2026-05-09', home: 'WHU', away: 'ARS' },
  { id: 'f-022', date: '2026-05-09', home: 'MCI', away: 'BRE' },

  // Midweek (17-22 May 2026)
  { id: 'f-030', date: '2026-05-17', home: 'MUN', away: 'NFO' },
  { id: 'f-031', date: '2026-05-17', home: 'AVL', away: 'LIV' },
  { id: 'f-032', date: '2026-05-17', home: 'BOU', away: 'MCI' },
  { id: 'f-033', date: '2026-05-17', home: 'ARS', away: 'BUR' },
  { id: 'f-034', date: '2026-05-22', home: 'MCI', away: 'CRY' },

  // Matchweek 38 — Final Day, all kick off same time (24 May 2026)
  { id: 'f-040', date: '2026-05-24', home: 'BHA', away: 'MUN' },
  { id: 'f-041', date: '2026-05-24', home: 'CRY', away: 'ARS' },
  { id: 'f-042', date: '2026-05-24', home: 'MCI', away: 'AVL' },
];
