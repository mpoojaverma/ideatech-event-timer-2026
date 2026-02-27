import TimerDisplay from '../components/TimerDisplay'
import { useEventTimer } from '../hooks/useEventTimer'
import { ROUNDS } from '../config/phases'

export default function DisplayPage() {
  const { timerState, remainingSeconds } = useEventTimer()
  const roundMeta = ROUNDS[timerState.roundKey] ?? ROUNDS.round1
  const statusLabel = timerState.status === 'running'
    ? 'Running'
    : timerState.status === 'paused'
      ? 'Paused'
      : timerState.status === 'ended'
        ? 'Ended'
        : 'Ready'

  return (
    <div className="w-full max-w-5xl flex flex-col items-center z-10">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h2 className="text-[#5EEAD4] text-xs md:text-sm tracking-[0.35em] font-bold uppercase">
          {roundMeta.number}
        </h2>
        <h1 className="text-white text-xl md:text-3xl tracking-[0.08em] font-black uppercase">
          {roundMeta.title}
        </h1>
        <p className="text-white/50 text-[10px] md:text-xs tracking-[0.2em] uppercase">
          {statusLabel}
        </p>
      </div>
      <TimerDisplay remainingSeconds={remainingSeconds} status={timerState.status} />
    </div>
  )
}
