import { useEffect, useState } from 'react'
import { round2LevelOptions, roundOptions } from '../config/phases'
import { formatTime } from '../utils/formatTime'
const MAX_DURATION_MINUTES = 24 * 60
const secondsToMinutes = (seconds) => (Math.max(0, Number(seconds) || 0) / 60).toString()
const normalizeMinutes = (value) => Math.min(MAX_DURATION_MINUTES, Math.max(0, value))
const minutesToSeconds = (minutes) => Math.floor(minutes * 60)

const parseRoundFromPhaseKey = (phaseKey) => {
  if (phaseKey === 'pre_event') return 'pre_event'
  if (phaseKey === 'round1') return 'round1'
  return 'round2'
}

const parseLevelFromPhaseKey = (phaseKey) => {
  if (phaseKey.startsWith('round2_')) return phaseKey.replace('round2_', '')
  return 'easy'
}

export default function AdminPanel({ timerState, remainingSeconds, actions }) {
  const [selectedRound, setSelectedRound] = useState(() => parseRoundFromPhaseKey(timerState.phaseKey))
  const [selectedLevel, setSelectedLevel] = useState(() => parseLevelFromPhaseKey(timerState.phaseKey))
  const [durationInput, setDurationInput] = useState(() => secondsToMinutes(timerState.duration))
  const [customOverrideInput, setCustomOverrideInput] = useState('')

  useEffect(() => {
    setSelectedRound(parseRoundFromPhaseKey(timerState.phaseKey))
    setSelectedLevel(parseLevelFromPhaseKey(timerState.phaseKey))
    setDurationInput(secondsToMinutes(timerState.duration))
  }, [timerState.phaseKey, timerState.duration])

  const applyPhaseSelection = (round, level) => {
    actions.loadPhase({ round, level })
  }

  const handleRoundChange = (value) => {
    setSelectedRound(value)
    applyPhaseSelection(value, selectedLevel)
  }

  const handleLevelChange = (value) => {
    setSelectedLevel(value)
    if (selectedRound === 'round2') {
      applyPhaseSelection('round2', value)
    }
  }

  const applyDuration = () => {
    const numeric = Number(durationInput)
    if (!Number.isFinite(numeric) || numeric < 0) return
    actions.setDurationSeconds(minutesToSeconds(normalizeMinutes(numeric)))
  }

  const applyCustomOverride = () => {
    const numeric = Number(customOverrideInput)
    if (!Number.isFinite(numeric) || numeric < 0) return
    actions.setDurationSeconds(minutesToSeconds(normalizeMinutes(numeric)))
    setCustomOverrideInput('')
  }

  return (
    <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <h3 className="text-[#5EEAD4] text-xs md:text-sm tracking-[0.3em] font-bold uppercase mb-6">
        Admin Control Panel
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em]">Select Round</span>
          <select
            value={selectedRound}
            onChange={(e) => handleRoundChange(e.target.value)}
            className="bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
          >
            {roundOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-left">
          <span className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em]">Select Level</span>
          <select
            value={selectedLevel}
            onChange={(e) => handleLevelChange(e.target.value)}
            disabled={selectedRound !== 'round2'}
            className="bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-40"
          >
            {round2LevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/80">
          <input
            type="checkbox"
            checked={timerState.includeIcebreaker}
            onChange={(e) => actions.setIncludeIcebreaker(e.target.checked)}
            className="accent-[#5EEAD4]"
          />
          Include Icebreaker In Next-Phase Flow
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <label className="flex flex-col gap-2 text-left">
          <span className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em]">Set Duration (minutes)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            className="bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={applyDuration}
            className="w-full px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase"
          >
            Apply Duration
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={actions.start}
          className="px-4 py-2 rounded-full bg-[#5EEAD4] text-black text-xs font-black tracking-[0.2em] uppercase"
        >
          Start
        </button>
        <button
          type="button"
          onClick={actions.pause}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={actions.reset}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={actions.moveToNextPhase}
          className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase"
        >
          Next Phase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => actions.addSeconds(60)}
            className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase"
          >
            +1 Minute Override
          </button>
        </div>
        <label className="flex flex-col gap-2 text-left">
          <span className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.2em]">Custom Time Override (minutes)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={customOverrideInput}
            onChange={(e) => setCustomOverrideInput(e.target.value)}
            className="bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={applyCustomOverride}
        className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black tracking-[0.2em] uppercase mb-5"
      >
        Apply Custom Override
      </button>

      <div className="text-left text-[11px] text-white/60 tracking-[0.15em] uppercase space-y-2">
        <p>Status: {timerState.status}</p>
        <p>Remaining: {formatTime(remainingSeconds)}</p>
        <p>Current Phase Key: {timerState.phaseKey}</p>
      </div>
    </div>
  )
}
