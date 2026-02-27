import { createContext, useEffect, useMemo, useState } from 'react'
import { defaultRounds, isValidRoundKey } from '../config/phases'

const STORAGE_KEY = 'eventTimerState'
const LEGACY_STORAGE_KEY = 'ideatech-event-timer-state-v2'
const MAX_DURATION_SECONDS = 24 * 60 * 60

export const EventTimerContext = createContext(null)

const normalizeDurationSeconds = (seconds) =>
  Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.floor(seconds)))

const getRoundDurationSeconds = (roundKey) =>
  normalizeDurationSeconds((defaultRounds[roundKey]?.durationMinutes ?? 30) * 60)

const getInitialRoundKey = () => 'marks_idea'

const createInitialState = () => {
  const roundKey = getInitialRoundKey()
  const durationSeconds = getRoundDurationSeconds(roundKey)
  return {
    roundKey,
    currentRound: defaultRounds[roundKey].name,
    duration: durationSeconds,
    roundDuration: durationSeconds,
    startTime: null,
    isRunning: false,
    status: 'not-started',
  }
}

const getRoundKeyFromLegacy = (parsed) => {
  if (isValidRoundKey(parsed.roundKey)) return parsed.roundKey
  if (parsed.phaseKey === 'round1' || parsed.phaseKey === 'marks_idea') return 'marks_idea'
  if (typeof parsed.phaseKey === 'string' && parsed.phaseKey.startsWith('round2')) return 'bug_slayer'
  if (typeof parsed.currentRound === 'string') {
    const value = parsed.currentRound.toLowerCase()
    if (value.includes("mark") || value.includes('round 1')) return 'marks_idea'
    if (value.includes('bug') || value.includes('round 2')) return 'bug_slayer'
  }
  return getInitialRoundKey()
}

const parseRawState = (raw) => {
  try {
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return createInitialState()

    const roundKey = getRoundKeyFromLegacy(parsed)
    const defaultDuration = getRoundDurationSeconds(roundKey)
    const duration = Number.isFinite(parsed.duration) ? normalizeDurationSeconds(parsed.duration) : defaultDuration
    const roundDuration = Number.isFinite(parsed.roundDuration)
      ? normalizeDurationSeconds(parsed.roundDuration)
      : Math.max(defaultDuration, duration)
    const status = ['not-started', 'running', 'paused', 'ended'].includes(parsed.status) ? parsed.status : 'not-started'
    const startTime = Number.isFinite(parsed.startTime) ? parsed.startTime : null
    const isRunning = Boolean(parsed.isRunning) && startTime !== null && status === 'running'

    return {
      roundKey,
      currentRound: defaultRounds[roundKey].name,
      duration,
      roundDuration,
      startTime,
      isRunning,
      status: isRunning ? 'running' : status === 'running' ? 'paused' : status,
    }
  } catch {
    return createInitialState()
  }
}

const parseStoredState = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return parseRawState(raw)
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
  return parseRawState(legacyRaw)
}

const isSameTimerState = (a, b) =>
  a.roundKey === b.roundKey
  && a.currentRound === b.currentRound
  && a.duration === b.duration
  && a.roundDuration === b.roundDuration
  && a.startTime === b.startTime
  && a.isRunning === b.isRunning
  && a.status === b.status

const getRemainingSeconds = (timerState, nowMs) => {
  if (!timerState.isRunning || !timerState.startTime) {
    return Math.max(0, Math.floor(timerState.duration))
  }
  const elapsedSeconds = Math.floor((nowMs - timerState.startTime) / 1000)
  return Math.max(0, Math.floor(timerState.duration - elapsedSeconds))
}

export function EventTimerProvider({ children }) {
  const [timerState, setTimerState] = useState(() => createInitialState())
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const restoredState = parseStoredState()
    setTimerState(restoredState)
    setNowMs(Date.now())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState))
  }, [timerState, hydrated])

  useEffect(() => {
    if (!hydrated) return undefined
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      const nextState = parseRawState(event.newValue)
      setTimerState((prev) => (isSameTimerState(prev, nextState) ? prev : nextState))
      setNowMs(Date.now())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return undefined
    if (!timerState.isRunning) return undefined
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 250)
    return () => window.clearInterval(intervalId)
  }, [timerState.isRunning, hydrated])

  const remainingSeconds = useMemo(
    () => getRemainingSeconds(timerState, nowMs),
    [timerState, nowMs],
  )

  useEffect(() => {
    if (timerState.status === 'running' && remainingSeconds === 0) {
      setTimerState((prev) => ({
        ...prev,
        duration: 0,
        startTime: null,
        isRunning: false,
        status: 'ended',
      }))
    }
  }, [remainingSeconds, timerState.status])

  const selectRound = (roundKey) => {
    if (!isValidRoundKey(roundKey)) return
    const durationSeconds = getRoundDurationSeconds(roundKey)
    setNowMs(Date.now())
    setTimerState((prev) => ({
      ...prev,
      roundKey,
      currentRound: defaultRounds[roundKey].name,
      duration: durationSeconds,
      roundDuration: durationSeconds,
      startTime: null,
      isRunning: false,
      status: 'paused',
    }))
  }

  const setDurationSeconds = (seconds) => {
    const nextDuration = normalizeDurationSeconds(seconds)
    setNowMs(Date.now())
    setTimerState((prev) => ({
      ...prev,
      duration: nextDuration,
      roundDuration: nextDuration,
      startTime: prev.isRunning ? Date.now() : null,
      status: nextDuration === 0 ? 'ended' : prev.isRunning ? 'running' : 'paused',
    }))
  }

  const start = () => {
    setNowMs(Date.now())
    setTimerState((prev) => {
      if (prev.isRunning || prev.duration <= 0) return prev
      return {
        ...prev,
        startTime: Date.now(),
        isRunning: true,
        status: 'running',
      }
    })
  }

  const pause = () => {
    setNowMs(Date.now())
    setTimerState((prev) => {
      if (!prev.isRunning) return prev
      const remaining = getRemainingSeconds(prev, Date.now())
      return {
        ...prev,
        duration: remaining,
        startTime: null,
        isRunning: false,
        status: remaining === 0 ? 'ended' : 'paused',
      }
    })
  }

  const reset = () => {
    setNowMs(Date.now())
    setTimerState((prev) => ({
      ...prev,
      duration: normalizeDurationSeconds(prev.roundDuration),
      startTime: null,
      isRunning: false,
      status: 'paused',
    }))
  }

  const value = useMemo(
    () => ({
      hydrated,
      timerState,
      remainingSeconds,
      actions: {
        selectRound,
        setDurationSeconds,
        start,
        pause,
        reset,
      },
    }),
    [hydrated, timerState, remainingSeconds],
  )

  if (!hydrated) return null

  return (
    <EventTimerContext.Provider value={value}>
      {children}
    </EventTimerContext.Provider>
  )
}
