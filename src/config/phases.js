export const ROUNDS = {
  round1: {
    label: "Round 1 - Mark's Idea",
    durationMinutes: 30,
  },
  round2: {
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
