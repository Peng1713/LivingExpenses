import type { BillCategoryKey } from '../../domain/categories'

export type BillFormValues = {
  date: import('dayjs').Dayjs
  time: import('dayjs').Dayjs
  category: BillCategoryKey
  amount: number
  note?: string
}

