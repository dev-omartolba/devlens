import { HistoryItem } from '../ai/types';

const STORAGE_KEY = 'devlens_history_v1';

export class HistoryStore {
  public static getAll(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static add(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    const items = this.getAll();
    const newItem: HistoryItem = {
      ...item,
      id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...items].slice(0, 50); // Keep latest 50 items
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist history item:', e);
    }
    return newItem;
  }

  public static remove(id: string): void {
    const items = this.getAll().filter(i => i.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  public static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}
