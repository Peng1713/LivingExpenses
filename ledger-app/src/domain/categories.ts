export const BILL_CATEGORIES = [
  { key: 'daily', label: '日用品' },
  { key: 'entertainment', label: '生活娱乐' },
  { key: 'transport', label: '出行交通' },
  { key: 'food', label: '餐饮' },
  { key: 'health', label: '医疗健康' },
  { key: 'study', label: '学习成长' },
  { key: 'other', label: '其他' },
] as const

export type BillCategoryKey = (typeof BILL_CATEGORIES)[number]['key']

export function categoryLabel(key: BillCategoryKey) {
  return BILL_CATEGORIES.find((c) => c.key === key)?.label ?? '其他'
}

