import { useContext } from 'react'
import { EventTimerContext } from '../context/EventTimerContext'

export const useEventTimer = () => {
  const context = useContext(EventTimerContext)
  if (!context) {
    throw new Error('useEventTimer must be used within EventTimerProvider')
  }
  return context
}
