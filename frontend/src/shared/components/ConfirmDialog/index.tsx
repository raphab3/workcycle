'use client';

import type { PropsWithChildren } from 'react';

import { Button } from '@/shared/components/Button';

import { confirmDialogStyles } from './styles';

interface ConfirmDialogProps extends PropsWithChildren {
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({ children, confirmLabel = 'Confirmar', description, isOpen, onCancel, onConfirm, title }: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={confirmDialogStyles.root} role="alertdialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar confirmacao" className={confirmDialogStyles.backdrop} onClick={onCancel} type="button" />
      <section className={confirmDialogStyles.panel}>
        <div className={confirmDialogStyles.copy}>
          <h2 className={confirmDialogStyles.title}>{title}</h2>
          <p className={confirmDialogStyles.description}>{description}</p>
          {children ? <div className={confirmDialogStyles.extra}>{children}</div> : null}
        </div>
        <div className={confirmDialogStyles.actions}>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="button" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}