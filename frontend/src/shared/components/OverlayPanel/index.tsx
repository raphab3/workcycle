'use client';

import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { cn } from '@/shared/utils/cn';

import { overlayPanelStyles } from './styles';

interface OverlayPanelProps extends PropsWithChildren {
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function OverlayPanel({ children, description, isOpen, onClose, title }: OverlayPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={overlayPanelStyles.root} role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Fechar painel" className={overlayPanelStyles.backdrop} onClick={onClose} type="button" />
      <section className={cn(overlayPanelStyles.panel, overlayPanelStyles.panelResponsive)}>
        <header className={overlayPanelStyles.header}>
          <div>
            <h2 className={overlayPanelStyles.title}>{title}</h2>
            {description ? <p className={overlayPanelStyles.description}>{description}</p> : null}
          </div>
          <button aria-label="Fechar painel" className={overlayPanelStyles.closeButton} onClick={onClose} type="button">
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </header>
        <div className={overlayPanelStyles.content}>{children}</div>
      </section>
    </div>
  );
}