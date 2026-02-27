import AdminPanel from '../components/AdminPanel'
import PhaseHeader from '../components/PhaseHeader'
import TimerDisplay from '../components/TimerDisplay'
import { useEventTimer } from '../hooks/useEventTimer'
import { useState } from 'react'

export default function AdminPage() {
  const { timerState, remainingSeconds, actions } = useEventTimer()
  const [authorized, setAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

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
      <PhaseHeader
        currentRound={timerState.currentRound}
        status={timerState.status}
      />
      <TimerDisplay remainingSeconds={remainingSeconds} status={timerState.status} />
      <AdminPanel timerState={timerState} remainingSeconds={remainingSeconds} actions={actions} />
    </div>
  )
}
