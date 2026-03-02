import type { BillItem } from '../types';

const STORAGE_KEY = 'daily-bills-data';

export function loadBills(): BillItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BillItem[];
  } catch {
    return [];
  }
}

export function saveBills(bills: BillItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
