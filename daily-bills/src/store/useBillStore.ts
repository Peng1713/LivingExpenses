import { useCallback, useSyncExternalStore } from 'react';
import type { BillItem } from '../types';
import { generateId, loadBills, saveBills } from '../utils/storage';

type Listener = () => void;

let bills: BillItem[] = loadBills();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): BillItem[] {
  return bills;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function addBill(item: Omit<BillItem, 'id' | 'createdAt'>) {
  const newBill: BillItem = { ...item, id: generateId(), createdAt: Date.now() };
  bills = [newBill, ...bills];
  saveBills(bills);
  emit();
}

function updateBill(id: string, updates: Partial<Omit<BillItem, 'id' | 'createdAt'>>) {
  bills = bills.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveBills(bills);
  emit();
}

function deleteBill(id: string) {
  bills = bills.filter((b) => b.id !== id);
  saveBills(bills);
  emit();
}

export function useBillStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot);

  return {
    bills: data,
    addBill: useCallback(addBill, []),
    updateBill: useCallback(updateBill, []),
    deleteBill: useCallback(deleteBill, []),
  };
}
