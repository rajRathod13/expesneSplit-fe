import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast } from './toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private readonly _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  private defaultDuration = 3000;

  success(message: string, title = 'Success', durationMs?: number) {
    this.push({ level: 'success', message, title, durationMs });
  }
  error(message: string, title = 'Error', durationMs?: number) {
    this.push({ level: 'error', message, title, durationMs });
  }
  info(message: string, title = 'Info', durationMs?: number) {
    this.push({ level: 'info', message, title, durationMs });
  }

  remove(id: string) {
    this._toasts$.next(this._toasts$.value.filter((t) => t.id !== id));
  }
  clearAll() {
    this._toasts$.next([]);
  }

  private push(input: Omit<Toast, 'id' | 'createdAt'>) {
    const toast: Toast = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      durationMs: input.durationMs ?? this.defaultDuration,
      ...input,
    };
    this._toasts$.next([...this._toasts$.value, toast]);
    if (toast.durationMs! > 0)
      setTimeout(() => this.remove(toast.id), toast.durationMs);
  }
}
