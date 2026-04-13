import * as Toast from '@radix-ui/react-toast';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface ToastOptions {
  title: string;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState<ToastOptions | null>(null);

  function showToast(options: ToastOptions) {
    setToastData(options);
    setOpen(false);
    setTimeout(() => setOpen(true), 50);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:translate-y-0 data-[state=closed]:translate-y-4 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] w-80 relative flex flex-col gap-2"
          open={open}
          onOpenChange={setOpen}
          duration={6000}
        >
          <div className="flex items-start justify-between">
            <Toast.Title className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
              {toastData?.title}
            </Toast.Title>
            <Toast.Close className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <X className="w-4 h-4" />
            </Toast.Close>
          </div>
          
          {toastData?.description && (
            <Toast.Description className="text-slate-500 dark:text-slate-400 text-sm">
              {toastData.description}
            </Toast.Description>
          )}

          {toastData?.linkTo && (
            <Toast.Action asChild altText="View">
              <Link
                to={toastData.linkTo}
                className="mt-1 inline-flex items-center justify-center rounded-md font-medium text-xs px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition-colors w-fit"
                onClick={() => setOpen(false)}
              >
                {toastData?.linkLabel || 'View details'}
              </Link>
            </Toast.Action>
          )}
        </Toast.Root>

        <Toast.Viewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-[390px] max-w-[100vw] m-0 list-none z-[100] outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
