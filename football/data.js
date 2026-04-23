// Premier League 2025-26 — illustrative data as of 23 April 2026.
// Standings reflect 34 of 38 games played; 4 matchdays remain.
// Stats are plausible mock figures for prototype purposes.

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

// Standings after 34 games. Keys: P, W, D, L, GF, GA.
// Points and GD are derived in app.js so we never duplicate a source of truth.
const CURRENT_STANDINGS = {
  LIV: { P: 34, W: 22, D: 7,  L: 5,  GF: 72, GA: 32 },
  ARS: { P: 34, W: 21, D: 8,  L: 5,  GF: 68, GA: 35 },
  MCI: { P: 34, W: 20, D: 7,  L: 7,  GF: 70, GA: 40 },
  CHE: { P: 34, W: 18, D: 8,  L: 8,  GF: 60, GA: 42 },
  NEW: { P: 34, W: 17, D: 9,  L: 8,  GF: 58, GA: 40 },
  TOT: { P: 34, W: 16, D: 8,  L: 10, GF: 62, GA: 48 },
  AVL: { P: 34, W: 15, D: 8,  L: 11, GF: 55, GA: 48 },
  MUN: { P: 34, W: 14, D: 9,  L: 11, GF: 52, GA: 48 },
  BHA: { P: 34, W: 13, D: 10, L: 11, GF: 48, GA: 45 },
  BOU: { P: 34, W: 13, D: 9,  L: 12, GF: 50, GA: 50 },
  WHU: { P: 34, W: 12, D: 9,  L: 13, GF: 45, GA: 50 },
  CRY: { P: 34, W: 11, D: 11, L: 12, GF: 42, GA: 46 },
  FUL: { P: 34, W: 11, D: 10, L: 13, GF: 40, GA: 48 },
  BRE: { P: 34, W: 11, D: 8,  L: 15, GF: 48, GA: 55 },
  EVE: { P: 34, W: 10, D: 10, L: 14, GF: 38, GA: 48 },
  WOL: { P: 34, W: 9,  D: 11, L: 14, GF: 40, GA: 52 },
  NFO: { P: 34, W: 9,  D: 10, L: 15, GF: 38, GA: 52 },
  LEE: { P: 34, W: 7,  D: 9,  L: 18, GF: 35, GA: 60 },
  BUR: { P: 34, W: 5,  D: 8,  L: 21, GF: 28, GA: 62 },
  SUN: { P: 34, W: 4,  D: 9,  L: 21, GF: 30, GA: 65 },
};

// Remaining fixtures. Each team plays 4 matches (matchdays 35-38).
// Home team listed first.
const FIXTURES = [
  // Matchday 35
  { id: 'f35-1',  md: 35, date: '2026-04-25', home: 'LIV', away: 'ARS' },
  { id: 'f35-2',  md: 35, date: '2026-04-25', home: 'MCI', away: 'CHE' },
  { id: 'f35-3',  md: 35, date: '2026-04-25', home: 'NEW', away: 'TOT' },
  { id: 'f35-4',  md: 35, date: '2026-04-26', home: 'AVL', away: 'MUN' },
  { id: 'f35-5',  md: 35, date: '2026-04-26', home: 'BHA', away: 'BOU' },
  { id: 'f35-6',  md: 35, date: '2026-04-26', home: 'WHU', away: 'CRY' },
  { id: 'f35-7',  md: 35, date: '2026-04-26', home: 'FUL', away: 'BRE' },
  { id: 'f35-8',  md: 35, date: '2026-04-27', home: 'EVE', away: 'WOL' },
  { id: 'f35-9',  md: 35, date: '2026-04-27', home: 'NFO', away: 'LEE' },
  { id: 'f35-10', md: 35, date: '2026-04-27', home: 'BUR', away: 'SUN' },

  // Matchday 36
  { id: 'f36-1',  md: 36, date: '2026-05-02', home: 'ARS', away: 'MCI' },
  { id: 'f36-2',  md: 36, date: '2026-05-02', home: 'CHE', away: 'LIV' },
  { id: 'f36-3',  md: 36, date: '2026-05-02', home: 'TOT', away: 'AVL' },
  { id: 'f36-4',  md: 36, date: '2026-05-03', home: 'MUN', away: 'NEW' },
  { id: 'f36-5',  md: 36, date: '2026-05-03', home: 'BOU', away: 'WHU' },
  { id: 'f36-6',  md: 36, date: '2026-05-03', home: 'CRY', away: 'FUL' },
  { id: 'f36-7',  md: 36, date: '2026-05-03', home: 'BRE', away: 'EVE' },
  { id: 'f36-8',  md: 36, date: '2026-05-04', home: 'WOL', away: 'NFO' },
  { id: 'f36-9',  md: 36, date: '2026-05-04', home: 'LEE', away: 'BUR' },
  { id: 'f36-10', md: 36, date: '2026-05-04', home: 'SUN', away: 'BHA' },

  // Matchday 37
  { id: 'f37-1',  md: 37, date: '2026-05-09', home: 'MCI', away: 'TOT' },
  { id: 'f37-2',  md: 37, date: '2026-05-09', home: 'LIV', away: 'MUN' },
  { id: 'f37-3',  md: 37, date: '2026-05-09', home: 'ARS', away: 'CHE' },
  { id: 'f37-4',  md: 37, date: '2026-05-10', home: 'NEW', away: 'BHA' },
  { id: 'f37-5',  md: 37, date: '2026-05-10', home: 'AVL', away: 'BOU' },
  { id: 'f37-6',  md: 37, date: '2026-05-10', home: 'CRY', away: 'BRE' },
  { id: 'f37-7',  md: 37, date: '2026-05-10', home: 'WHU', away: 'WOL' },
  { id: 'f37-8',  md: 37, date: '2026-05-11', home: 'FUL', away: 'LEE' },
  { id: 'f37-9',  md: 37, date: '2026-05-11', home: 'EVE', away: 'SUN' },
  { id: 'f37-10', md: 37, date: '2026-05-11', home: 'NFO', away: 'BUR' },

  // Matchday 38 (Final Day)
  { id: 'f38-1',  md: 38, date: '2026-05-24', home: 'MUN', away: 'CHE' },
  { id: 'f38-2',  md: 38, date: '2026-05-24', home: 'TOT', away: 'LIV' },
  { id: 'f38-3',  md: 38, date: '2026-05-24', home: 'ARS', away: 'NEW' },
  { id: 'f38-4',  md: 38, date: '2026-05-24', home: 'MCI', away: 'AVL' },
  { id: 'f38-5',  md: 38, date: '2026-05-24', home: 'BHA', away: 'CRY' },
  { id: 'f38-6',  md: 38, date: '2026-05-24', home: 'BOU', away: 'FUL' },
  { id: 'f38-7',  md: 38, date: '2026-05-24', home: 'BRE', away: 'WHU' },
  { id: 'f38-8',  md: 38, date: '2026-05-24', home: 'WOL', away: 'EVE' },
  { id: 'f38-9',  md: 38, date: '2026-05-24', home: 'BUR', away: 'NFO' },
  { id: 'f38-10', md: 38, date: '2026-05-24', home: 'SUN', away: 'LEE' },
];
