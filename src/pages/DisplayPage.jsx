import TimerDisplay from '../components/TimerDisplay'
import { useEventTimer } from '../hooks/useEventTimer'
import { ROUNDS } from '../config/phases'

export default function DisplayPage() {
  const { timerState, remainingSeconds } = useEventTimer()
  const roundLabel = ROUNDS[timerState.roundKey]?.label ?? timerState.currentRound
  const statusLabel = timerState.status === 'running'
    ? 'Running'
    : timerState.status === 'paused'
      ? 'Paused'
      : timerState.status === 'ended'
        ? 'Round Completed'
        : 'Ready'

  return (
    <div className="w-full max-w-5xl flex flex-col items-center z-10">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h2 className="text-[#5EEAD4] text-xs md:text-sm tracking-[0.35em] font-bold uppercase">
          {roundLabel}
        </h2>
        <p className="text-white/50 text-[10px] md:text-xs tracking-[0.2em] uppercase">
          {statusLabel}
        </p>
      </div>
      <TimerDisplay remainingSeconds={remainingSeconds} status={timerState.status} />
    </div>
  )
}
