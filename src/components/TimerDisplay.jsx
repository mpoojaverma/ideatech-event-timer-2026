const toClock = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  }
}

function Tile({ label, value, alert }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`timer-card ${alert ? '!border-red-500/50 !shadow-[0_0_25px_rgba(239,68,68,0.3)]' : ''}`}>
        <span className={`timer-number ${alert ? '!text-red-500 !shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}>
          {value}
        </span>
      </div>
      <span className="timer-label">{label}</span>
    </div>
  )
}

export default function TimerDisplay({ remainingSeconds, status }) {
  const time = toClock(remainingSeconds)
  const isLowTimeAlert = remainingSeconds > 0 && remainingSeconds <= 300 && status === 'running'

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-6 md:gap-12 mb-10 justify-center w-full">
        <Tile label="HOURS" value={time.h} alert={isLowTimeAlert} />
        <div className="text-2xl md:text-5xl text-[#6EC1C3]/30 font-bold mb-10">:</div>
        <Tile label="MINUTES" value={time.m} alert={isLowTimeAlert} />
        <div className="text-2xl md:text-5xl text-[#6EC1C3]/30 font-bold mb-10">:</div>
        <Tile label="SECONDS" value={time.s} alert={isLowTimeAlert} />
      </div>
      {status === 'ended' && (
        <p className="text-[#5EEAD4] text-xs md:text-sm tracking-[0.35em] font-bold uppercase">
          Waiting for Admin Action
        </p>
      )}
    </div>
  )
}
