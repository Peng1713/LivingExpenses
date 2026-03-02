export interface BillItem {
  id: string;
  date: string; // YYYY-MM-DD
  category: CategoryType;
  description: string;
  amount: number;
  createdAt: number;
}

export type CategoryType =
  | 'food'
  | 'transport'
  | 'daily'
  | 'entertainment'
  | 'shopping'
  | 'housing'
  | 'medical'
  | 'education'
  | 'other';

export interface CategoryInfo {
  key: CategoryType;
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'food', label: '餐饮美食', color: '#f5222d', icon: 'CoffeeOutlined' },
  { key: 'transport', label: '出行交通', color: '#fa8c16', icon: 'CarOutlined' },
  { key: 'daily', label: '日用品', color: '#52c41a', icon: 'ShoppingOutlined' },
  { key: 'entertainment', label: '生活娱乐', color: '#1890ff', icon: 'SmileOutlined' },
  { key: 'shopping', label: '购物消费', color: '#722ed1', icon: 'ShoppingCartOutlined' },
  { key: 'housing', label: '住房缴费', color: '#13c2c2', icon: 'HomeOutlined' },
  { key: 'medical', label: '医疗健康', color: '#eb2f96', icon: 'MedicineBoxOutlined' },
  { key: 'education', label: '学习教育', color: '#2f54eb', icon: 'ReadOutlined' },
  { key: 'other', label: '其他支出', color: '#8c8c8c', icon: 'EllipsisOutlined' },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryType, CategoryInfo>;
