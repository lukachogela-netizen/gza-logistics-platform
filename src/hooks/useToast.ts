import { useCallback, useEffect, useState } from 'react';

export type ToastKind = 'success' | 'error' | 'info';
export interface ToastMessage {
  id: string;
  message: string;
  kind: ToastKind;
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ id: `${Date.now()}-${Math.random()}`, message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return { toast, showToast, dismissToast: () => setToast(null) };
}
