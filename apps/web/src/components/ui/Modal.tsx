import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ isOpen, onClose, title, children, footer, className }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-console/50 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[85vh] w-full max-w-lg animate-scale-in flex-col rounded-lg border border-border bg-paper-raised shadow-floating',
          className,
        )}
      >
        <h2 id="modal-title" className="shrink-0 px-6 pt-6 font-display text-display-sm font-semibold text-ink">
          {title}
        </h2>
        <div className="mt-5 flex-1 overflow-y-auto border-t border-border px-6 pb-6 pt-5">{children}</div>
        {footer && <div className="mt-6 flex shrink-0 justify-end gap-3 border-t border-border px-6 py-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
