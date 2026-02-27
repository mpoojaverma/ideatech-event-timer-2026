export const defaultRounds = {
  marks_idea: {
    name: "Mark's Idea",
    durationMinutes: 30,
  },
  bug_slayer: {
    name: 'Bug Slayer',
    durationMinutes: 10,
  },
}

export const roundOptions = [
  { value: 'marks_idea', label: "Mark's Idea" },
  { value: 'bug_slayer', label: 'Bug Slayer' },
]

export const isValidRoundKey = (roundKey) => Boolean(defaultRounds[roundKey])
