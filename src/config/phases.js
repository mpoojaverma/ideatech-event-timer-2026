export const defaultPhases = {
  pre_event: {
    round: 'Pre-event',
    phase: 'Countdown',
    durationMinutes: 15,
  },
  round1: {
    round: 'Round 1',
    phase: 'Design & Pitching',
    durationMinutes: 30,
  },
  round2_icebreaker: {
    round: 'Round 2',
    phase: 'Icebreaker',
    durationMinutes: 2,
  },
  round2_easy: {
    round: 'Round 2',
    phase: 'Code Rally - Easy',
    durationMinutes: 2,
  },
  round2_medium: {
    round: 'Round 2',
    phase: 'Code Rally - Medium',
    durationMinutes: 5,
  },
  round2_hard: {
    round: 'Round 2',
    phase: 'Code Rally - Hard',
    durationMinutes: 10,
  },
}

export const roundOptions = [
  { value: 'pre_event', label: 'Pre-event Countdown' },
  { value: 'round1', label: 'Round 1 - Design & Pitching' },
  { value: 'round2', label: 'Round 2 - Code Rally' },
]

export const round2LevelOptions = [
  { value: 'icebreaker', label: 'Icebreaker' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export const buildPhaseKey = (round, level) => {
  if (round === 'pre_event') return 'pre_event'
  if (round === 'round1') return 'round1'
  if (round === 'round2') return `round2_${level}`
  return 'pre_event'
}

export const getPhaseSequence = (includeIcebreaker) => {
  const base = ['pre_event', 'round1']
  if (includeIcebreaker) base.push('round2_icebreaker')
  return [...base, 'round2_easy', 'round2_medium', 'round2_hard']
}
