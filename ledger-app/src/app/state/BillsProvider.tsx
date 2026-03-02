import { nanoid } from 'nanoid'
import React, { useCallback, useMemo, useState } from 'react'
import type { Bill } from '../../domain/bill'
import { billsSchemaV1 } from '../../domain/validators'
import { loadBills, saveBills } from '../../storage/billsRepository'
import { BillsContext, normalizeBills, type BillDraft, type BillsContextValue } from './billsStore'

export function BillsProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await loadBills()
        if (!cancelled) setBills(normalizeBills(loaded))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: Bill[]) => {
    setBills(next)
    await saveBills(next)
  }, [])

  const addBill = useCallback(
    async (draft: BillDraft) => {
      const now = new Date().toISOString()
      const bill: Bill = {
        id: nanoid(),
        occurredAt: draft.occurredAt,
        amount: draft.amount,
        category: draft.category,
        note: draft.note?.trim() ? draft.note.trim() : undefined,
        createdAt: now,
        updatedAt: now,
      }
      await persist(normalizeBills([bill, ...bills]))
    },
    [bills, persist],
  )

  const updateBill = useCallback(
    async (id: string, patch: Partial<BillDraft>) => {
      const next = normalizeBills(
        bills.map((b) => {
          if (b.id !== id) return b
          return {
            ...b,
            ...patch,
            note:
              patch.note !== undefined
                ? patch.note.trim()
                  ? patch.note.trim()
                  : undefined
                : b.note,
            updatedAt: new Date().toISOString(),
          }
        }),
      )
      await persist(next)
    },
    [bills, persist],
  )

  const removeBill = useCallback(
    async (id: string) => {
      await persist(bills.filter((b) => b.id !== id))
    },
    [bills, persist],
  )

  const replaceAll = useCallback(
    async (nextBills: Bill[]) => {
      await persist(normalizeBills(nextBills))
    },
    [persist],
  )

  const exportJson = useCallback(async () => {
    const payload = { version: 1 as const, bills }
    return JSON.stringify(payload, null, 2)
  }, [bills])

  const importJson = useCallback(
    async (jsonText: string, mode: 'merge' | 'replace') => {
      const raw = JSON.parse(jsonText) as unknown
      const parsed = billsSchemaV1.parse(raw)
      const incoming = normalizeBills(parsed.bills)
      if (mode === 'replace') {
        await persist(incoming)
        return
      }
      const byId = new Map<string, Bill>()
      for (const b of bills) byId.set(b.id, b)
      for (const b of incoming) byId.set(b.id, b)
      await persist(normalizeBills(Array.from(byId.values())))
    },
    [bills, persist],
  )

  const clearAll = useCallback(async () => {
    await persist([])
  }, [persist])

  const value = useMemo<BillsContextValue>(
    () => ({
      bills,
      loading,
      addBill,
      updateBill,
      removeBill,
      replaceAll,
      exportJson,
      importJson,
      clearAll,
    }),
    [addBill, bills, clearAll, exportJson, importJson, loading, removeBill, replaceAll, updateBill],
  )

  return <BillsContext.Provider value={value}>{children}</BillsContext.Provider>
}

