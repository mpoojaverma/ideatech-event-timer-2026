import { createContext, useEffect, useMemo, useState } from 'react'
import { buildPhaseKey, defaultPhases, getPhaseSequence } from '../config/phases'

const STORAGE_KEY = 'eventTimerState'
const LEGACY_STORAGE_KEY = 'ideatech-event-timer-state-v2'
const MAX_DURATION_SECONDS = 24 * 60 * 60

export const EventTimerContext = createContext(null)

const getRoundAndPhase = (phaseKey) => {
  const phase = defaultPhases[phaseKey] ?? defaultPhases.pre_event
  return { currentRound: phase.round, currentPhase: phase.phase }
}

const createInitialState = () => {
  const phaseKey = 'pre_event'
  const { currentRound, currentPhase } = getRoundAndPhase(phaseKey)
  return {
    currentRound,
    currentPhase,
    phaseKey,
    duration: defaultPhases[phaseKey].durationMinutes * 60,
    startTime: null,
    isRunning: false,
    status: 'not-started',
    includeIcebreaker: false,
  }
}

const parseRawState = (raw) => {
  try {
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return createInitialState()

    const phaseKey = parsed.phaseKey && defaultPhases[parsed.phaseKey] ? parsed.phaseKey : 'pre_event'
    const fallbackPhase = getRoundAndPhase(phaseKey)
    const currentRound = typeof parsed.currentRound === 'string' && parsed.currentRound.trim()
      ? parsed.currentRound
      : fallbackPhase.currentRound
    const currentPhase = typeof parsed.currentPhase === 'string' && parsed.currentPhase.trim()
      ? parsed.currentPhase
      : fallbackPhase.currentPhase

    const sanitizedStatus = ['not-started', 'running', 'paused', 'ended'].includes(parsed.status) ? parsed.status : 'not-started'
    const sanitizedStartTime = Number.isFinite(parsed.startTime) ? parsed.startTime : null
    const sanitizedRunning = Boolean(parsed.isRunning) && sanitizedStartTime !== null && sanitizedStatus === 'running'

    return {
      currentRound,
      currentPhase,
      phaseKey,
      duration: Number.isFinite(parsed.duration)
        ? Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.floor(parsed.duration)))
        : defaultPhases[phaseKey].durationMinutes * 60,
      startTime: sanitizedStartTime,
      isRunning: sanitizedRunning,
      status: sanitizedRunning ? 'running' : sanitizedStatus === 'running' ? 'paused' : sanitizedStatus,
      includeIcebreaker: Boolean(parsed.includeIcebreaker),
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
  a.currentRound === b.currentRound
  && a.currentPhase === b.currentPhase
  && a.phaseKey === b.phaseKey
  && a.duration === b.duration
  && a.startTime === b.startTime
  && a.isRunning === b.isRunning
  && a.status === b.status
  && a.includeIcebreaker === b.includeIcebreaker

const getRemainingSeconds = (timerState, nowMs) => {
  if (!timerState.isRunning || !timerState.startTime) {
    return Math.max(0, Math.floor(timerState.duration))
  }
  const elapsedSeconds = Math.floor((nowMs - timerState.startTime) / 1000)
  return Math.max(0, Math.floor(timerState.duration - elapsedSeconds))
}

const normalizeDurationSeconds = (seconds) =>
  Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.floor(seconds)))

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

  const loadPhase = ({ round, level }) => {
    const phaseKey = buildPhaseKey(round, level)
    const phase = defaultPhases[phaseKey] ?? defaultPhases.pre_event
    setNowMs(Date.now())
    setTimerState((prev) => ({
      ...prev,
      phaseKey,
      currentRound: phase.round,
      currentPhase: phase.phase,
      duration: normalizeDurationSeconds(phase.durationMinutes * 60),
      startTime: null,
      isRunning: false,
      status: 'paused',
    }))
  }

  const setDurationSeconds = (seconds) => {
    setNowMs(Date.now())
    setTimerState((prev) => {
      const nextDuration = normalizeDurationSeconds(seconds)
      return {
        ...prev,
        duration: nextDuration,
        startTime: prev.isRunning ? Date.now() : null,
        status: nextDuration === 0 ? 'ended' : prev.isRunning ? 'running' : 'paused',
      }
    })
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
    setTimerState((prev) => {
      return {
        ...prev,
        duration: normalizeDurationSeconds(prev.duration),
        startTime: null,
        isRunning: false,
        status: 'paused',
      }
    })
  }

  const moveToNextPhase = () => {
    setNowMs(Date.now())
    setTimerState((prev) => {
      const sequence = getPhaseSequence(prev.includeIcebreaker)
      const currentIndex = sequence.indexOf(prev.phaseKey)
      const nextPhaseKey = currentIndex >= 0 && currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : prev.phaseKey
      const phase = defaultPhases[nextPhaseKey] ?? defaultPhases.pre_event
      return {
        ...prev,
        phaseKey: nextPhaseKey,
        currentRound: phase.round,
        currentPhase: phase.phase,
        duration: normalizeDurationSeconds(phase.durationMinutes * 60),
        startTime: null,
        isRunning: false,
        status: 'not-started',
      }
    })
  }

  const addSeconds = (secondsToAdd) => {
    setNowMs(Date.now())
    setTimerState((prev) => {
      const baseRemaining = getRemainingSeconds(prev, Date.now())
      const nextDuration = normalizeDurationSeconds(baseRemaining + Math.floor(secondsToAdd))
      return {
        ...prev,
        duration: nextDuration,
        startTime: prev.isRunning ? Date.now() : null,
        status: nextDuration === 0 ? 'ended' : prev.isRunning ? 'running' : prev.status === 'not-started' ? 'not-started' : 'paused',
      }
    })
  }

  const setIncludeIcebreaker = (includeIcebreaker) => {
    setTimerState((prev) => ({ ...prev, includeIcebreaker }))
  }

  const value = useMemo(
    () => ({
      hydrated,
      timerState,
      remainingSeconds,
      actions: {
        loadPhase,
        setDurationSeconds,
        start,
        pause,
        reset,
        moveToNextPhase,
        addSeconds,
        setIncludeIcebreaker,
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
