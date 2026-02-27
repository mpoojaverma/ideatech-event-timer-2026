import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import DisplayPage from './pages/DisplayPage'
import { EventTimerProvider } from './context/EventTimerContext'
import { useEventTimer } from './hooks/useEventTimer'
import { formatTime } from './utils/formatTime'

function AppRoutes() {
  const location = useLocation()
  const { timerState, remainingSeconds } = useEventTimer()

  useEffect(() => {
    console.log('[Router] Current route:', location.pathname)
    console.log('[Timer] Current timer state:', timerState.status)
    console.log('[Timer] Current round:', timerState.currentRound)
    console.log('[Timer] Remaining:', formatTime(remainingSeconds))
  }, [location.pathname, timerState.status, timerState.currentRound, remainingSeconds])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
      <Routes>
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Navigate to="/display" replace />} />
        <Route path="*" element={<Navigate to="/display" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <EventTimerProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </EventTimerProvider>
  )
}
