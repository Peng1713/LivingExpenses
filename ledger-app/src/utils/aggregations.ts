import dayjs from 'dayjs'
import type { Bill } from '../domain/bill'
import type { BillCategoryKey } from '../domain/categories'

export function dayKey(iso: string) {
  return dayjs(iso).format('YYYY-MM-DD')
}

export function monthKey(iso: string) {
  return dayjs(iso).format('YYYY-MM')
}

export function isInMonth(iso: string, month: dayjs.Dayjs) {
  const d = dayjs(iso)
  return d.year() === month.year() && d.month() === month.month()
}

export function sumAmount(bills: Bill[]) {
  return bills.reduce((s, b) => s + b.amount, 0)
}

export function sumByCategory(bills: Bill[]) {
  const map = new Map<BillCategoryKey, number>()
  for (const b of bills) map.set(b.category, (map.get(b.category) ?? 0) + b.amount)
  return Array.from(map.entries()).map(([category, value]) => ({ category, value }))
}

export function sumByDay(bills: Bill[]) {
  const map = new Map<string, number>()
  for (const b of bills) {
    const k = dayKey(b.occurredAt)
    map.set(k, (map.get(k) ?? 0) + b.amount)
  }
  return Array.from(map.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

