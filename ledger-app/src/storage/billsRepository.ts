import { billsSchemaV1, type BillsDataV1 } from '../domain/validators'
import type { Bill } from '../domain/bill'
import { kv } from './kv'

const STORAGE_KEY = 'ledger.bills'

function empty(): BillsDataV1 {
  return { version: 1, bills: [] }
}

export async function loadBills(): Promise<Bill[]> {
  const raw = await kv.getItem<unknown>(STORAGE_KEY)
  if (!raw) return []
  const parsed = billsSchemaV1.safeParse(raw)
  if (!parsed.success) return []
  return parsed.data.bills
}

export async function saveBills(bills: Bill[]): Promise<void> {
  const data: BillsDataV1 = { version: 1, bills }
  await kv.setItem(STORAGE_KEY, data)
}

export async function clearBills(): Promise<void> {
  await kv.setItem(STORAGE_KEY, empty())
}

