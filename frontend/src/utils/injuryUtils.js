/**
 * injuryUtils.js — Shared injury status display logic
 *
 * Two status fields come from the API:
 *   status        — NFL roster status: Active, IR, PUP, Inactive
 *   injury_status — Weekly game designation: Questionable, Out, Doubtful
 */

export const INJURY_LEVEL = {
  NONE:       'none',
  QUESTION:   'question',   // Q — limited but practicing, game-time decision
  DOUBTFUL:   'doubtful',   // D — very unlikely to play
  OUT:        'out',        // O — officially ruled out this week
  IR:         'ir',         // IR / PUP — season-ending or extended absence
};

/**
 * Resolve the effective injury level from both status fields.
 * injury_status (weekly) takes priority over roster status.
 */
export function getInjuryLevel(status, injuryStatus) {
  const s  = (status       || '').toLowerCase();
  const is = (injuryStatus || '').toLowerCase();

  if (s === 'ir' || s === 'pup')     return INJURY_LEVEL.IR;
  if (is === 'out')                   return INJURY_LEVEL.OUT;
  if (is === 'doubtful')              return INJURY_LEVEL.DOUBTFUL;
  if (is === 'questionable')          return INJURY_LEVEL.QUESTION;
  return INJURY_LEVEL.NONE;
}

const DISPLAY = {
  [INJURY_LEVEL.NONE]:     null,
  [INJURY_LEVEL.QUESTION]: { badge: 'Q',   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  blocked: false },
  [INJURY_LEVEL.DOUBTFUL]: { badge: 'D',   color: '#F97316', bg: 'rgba(249,115,22,0.15)',  blocked: false },
  [INJURY_LEVEL.OUT]:      { badge: 'O',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   blocked: true  },
  [INJURY_LEVEL.IR]:       { badge: 'IR',  color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   blocked: true  },
};

/**
 * Returns display config for an injury level, or null if healthy.
 * { badge, color, bg, blocked }
 */
export function getInjuryDisplay(status, injuryStatus) {
  const level = getInjuryLevel(status, injuryStatus);
  return DISPLAY[level] ?? null;
}

/** True if the player cannot play this week */
export function isBlocked(status, injuryStatus) {
  const level = getInjuryLevel(status, injuryStatus);
  return level === INJURY_LEVEL.OUT || level === INJURY_LEVEL.IR;
}

/** Score penalty to apply to confidence calculation */
export function injuryPenalty(status, injuryStatus) {
  const level = getInjuryLevel(status, injuryStatus);
  switch (level) {
    case INJURY_LEVEL.IR:
    case INJURY_LEVEL.OUT:      return -100; // blocked entirely
    case INJURY_LEVEL.DOUBTFUL: return -30;
    case INJURY_LEVEL.QUESTION: return -12;
    default:                    return 0;
  }
}
