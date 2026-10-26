import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import type { ToastMessage } from '../hooks/useToast';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;
  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? TriangleAlert : Info;
  return (
    <div className={`toast toast--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <Icon size={18} />
      <span>{toast.message}</span>
      <button type="button" className="toast__close" aria-label="შეტყობინების დახურვა" onClick={onDismiss}><X size={15} /></button>
    </div>
  );
}
