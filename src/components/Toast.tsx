import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | null;
  message: string | null;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  if (!message || !type) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        )}
        <p className="text-sm font-medium pr-2">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
