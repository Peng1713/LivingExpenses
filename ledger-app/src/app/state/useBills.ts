import { useContext } from 'react'
import { BillsContext } from './billsStore'

export function useBills() {
  const ctx = useContext(BillsContext)
  if (!ctx) throw new Error('useBills 必须在 BillsProvider 内使用')
  return ctx
}

