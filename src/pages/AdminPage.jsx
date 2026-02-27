import { useState } from 'react'
import AdminPanel from '../components/AdminPanel'
import TimerDisplay from '../components/TimerDisplay'
import { ROUNDS } from '../config/phases'
import { useEventTimer } from '../hooks/useEventTimer'

export default function AdminPage() {
  const { timerState, remainingSeconds, actions } = useEventTimer()
  const [authorized, setAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const roundMeta = ROUNDS[timerState.roundKey] ?? ROUNDS.round1
  const statusLabel = timerState.status === 'running'
    ? 'Running'
    : timerState.status === 'paused'
      ? 'Paused'
      : timerState.status === 'ended'
        ? 'Ended'
        : 'Ready'

  const handleEnter = () => {
    if (passwordInput === 'ideatech2026') {
      setAuthorized(true)
      return
    }
    window.alert('Incorrect password')
  }

  if (!authorized) {
    return (
      <div className="w-full max-w-md flex flex-col items-center z-10 gap-4">
        <h2 className="text-[#5EEAD4] text-sm md:text-base tracking-[0.3em] font-bold uppercase">
          Admin Access
        </h2>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEnter()
          }}
          className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
        />
        <button
          type="button"
          onClick={handleEnter}
          className="px-6 py-2 rounded-full bg-[#5EEAD4] text-black text-xs font-black tracking-[0.2em] uppercase"
        >
          Enter
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl flex flex-col items-center z-10 gap-8">
      <div className="flex flex-col items-center gap-2 mb-2 text-center">
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
      <AdminPanel timerState={timerState} remainingSeconds={remainingSeconds} actions={actions} />
    </div>
  )
}
