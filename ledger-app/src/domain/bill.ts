import type { BillCategoryKey } from './categories'

export type Bill = {
  id: string
  occurredAt: string // ISO string
  amount: number // 支出为正数
  category: BillCategoryKey
  note?: string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

