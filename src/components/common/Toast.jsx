import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

const styles = { success: ['bg-green-600', CheckCircle2], error: ['bg-red-600', AlertCircle], info: ['bg-slate-800', Info] }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-20 right-4 left-4 sm:left-auto lg:bottom-6 z-[60] flex flex-col gap-2" aria-live="polite">
        {toasts.map(({ id, message, type }) => {
          const [bg, Icon] = styles[type]
          return (
            <div key={id} className={`${bg} flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg`}>
              <Icon size={18} /> {message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
