import dayjs from 'dayjs'
import { createContext } from 'react'
import type { Bill } from '../../domain/bill'
import type { BillCategoryKey } from '../../domain/categories'

export type BillDraft = {
  occurredAt: string
  amount: number
  category: BillCategoryKey
  note?: string
}

export type BillsContextValue = {
  bills: Bill[]
  loading: boolean
  addBill: (draft: BillDraft) => Promise<void>
  updateBill: (id: string, patch: Partial<BillDraft>) => Promise<void>
  removeBill: (id: string) => Promise<void>
  replaceAll: (bills: Bill[]) => Promise<void>
  exportJson: () => Promise<string>
  importJson: (jsonText: string, mode: 'merge' | 'replace') => Promise<void>
  clearAll: () => Promise<void>
}

export const BillsContext = createContext<BillsContextValue | null>(null)

export function normalizeBills(bills: Bill[]) {
  return [...bills]
    .filter((b) => Number.isFinite(b.amount) && !!b.id)
    .sort((a, b) => dayjs(b.occurredAt).valueOf() - dayjs(a.occurredAt).valueOf())
}

