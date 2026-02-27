export default function PhaseHeader({ currentRound, currentPhase, status }) {
  const statusLabel = status === 'ended' ? 'Round Completed' : status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Ready'

  return (
    <div className="flex flex-col items-center gap-2 mb-8 text-center">
      <h2 className="text-[#5EEAD4] text-xs md:text-sm tracking-[0.35em] font-bold uppercase">
        {currentRound}
      </h2>
      <h1 className="text-white text-xl md:text-3xl tracking-[0.08em] font-black uppercase">
        {status === 'ended' ? 'Round Completed' : currentPhase}
      </h1>
      <p className="text-white/50 text-[10px] md:text-xs tracking-[0.2em] uppercase">
        {statusLabel}
      </p>
    </div>
  )
}
