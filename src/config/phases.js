export const ROUNDS = {
  round1: {
    number: 'ROUND 1',
    title: "MARK'S IDEA",
    label: "Round 1 - Mark's Idea",
    durationMinutes: 30,
  },
  round2: {
    number: 'ROUND 2',
    title: 'BUG SLAYER',
    label: 'Round 2 - Bug Slayer',
    durationMinutes: 10,
  },
}

export const defaultRounds = ROUNDS

export const roundOptions = [
  { value: 'round1', label: ROUNDS.round1.label },
  { value: 'round2', label: ROUNDS.round2.label },
]

export const isValidRoundKey = (roundKey) => Boolean(defaultRounds[roundKey])
