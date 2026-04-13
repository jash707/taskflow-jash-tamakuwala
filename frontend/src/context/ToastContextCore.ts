import { createContext } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
}

export interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
