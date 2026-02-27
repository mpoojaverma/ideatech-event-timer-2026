import PhaseHeader from '../components/PhaseHeader'
import TimerDisplay from '../components/TimerDisplay'
import { useEventTimer } from '../hooks/useEventTimer'

export default function DisplayPage() {
  const { timerState, remainingSeconds } = useEventTimer()
  const effectiveRound = timerState.status === 'not-started' ? 'Pre-event' : timerState.currentRound
  const effectivePhase = timerState.status === 'not-started' ? 'Countdown' : timerState.currentPhase

  return (
    <div className="w-full max-w-5xl flex flex-col items-center z-10">
      <PhaseHeader
        currentRound={effectiveRound}
        currentPhase={effectivePhase}
        status={timerState.status}
      />
      <TimerDisplay remainingSeconds={remainingSeconds} status={timerState.status} />
    </div>
  )
}
