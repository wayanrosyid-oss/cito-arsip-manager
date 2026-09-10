import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg bg-[#275d1d] border-2 border-white/40 text-white px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      <CheckCircle className="w-4 h-4 text-white shrink-0" />
      <span className="text-xs sm:text-sm font-bold tracking-wide">{message}</span>
    </div>
  );
};
