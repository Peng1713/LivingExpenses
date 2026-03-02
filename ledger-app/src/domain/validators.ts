import { z } from 'zod'

export const billCategoryKeySchema = z.enum([
  'daily',
  'entertainment',
  'transport',
  'food',
  'health',
  'study',
  'other',
])

export const billSchema = z.object({
  id: z.string().min(1),
  occurredAt: z.string().min(1),
  amount: z.number().finite(),
  category: billCategoryKeySchema,
  note: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const billsSchemaV1 = z.object({
  version: z.literal(1),
  bills: z.array(billSchema),
})

export type BillsDataV1 = z.infer<typeof billsSchemaV1>

