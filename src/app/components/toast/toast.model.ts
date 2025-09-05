export type ToastLevel = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  level: ToastLevel;
  title?: string;
  message: string;
  durationMs?: number; // default 3000
  createdAt: number;
}
