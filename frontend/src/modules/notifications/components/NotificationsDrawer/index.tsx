'use client';

import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { OverlayPanel } from '@/shared/components/OverlayPanel';

import { useNotificationsStore } from '../../store/useNotificationsStore';
import { notificationsDrawerStyles } from './styles';

import type { ReminderHistoryItem } from '../../types/history';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatHistoryStatus(item: ReminderHistoryItem) {
  if (item.status === 'shown') {
    return 'Exibido';
  }

  if (item.status === 'suppressed') {
    return 'Suprimido';
  }

  if (item.status === 'resolved') {
    return 'Resolvido';
  }

  return 'Perdido';
}

function formatHistoryLabel(item: ReminderHistoryItem) {
  return item.contextLabel ?? item.type;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const activeInAppNotification = useNotificationsStore((state) => state.activeInAppNotification);
  const dismissNotificationEvent = useNotificationsStore((state) => state.dismissNotificationEvent);
  const reminderHistory = useNotificationsStore((state) => state.reminderHistory);
  const recentHistory = reminderHistory.slice(0, 8);

  function handleResolveActiveNotification() {
    if (!activeInAppNotification) {
      return;
    }

    dismissNotificationEvent(activeInAppNotification.eventId);
  }

  return (
    <OverlayPanel
      description="Acompanhe o aviso in-app ativo e o historico curto que o motor de notificacoes reconciliou neste navegador."
      isOpen={isOpen}
      onClose={onClose}
      title="Central de notificacoes operacionais"
    >
      <div className={notificationsDrawerStyles.stack}>
        <section className={notificationsDrawerStyles.section}>
          <div className={notificationsDrawerStyles.sectionHeader}>
            <p className={notificationsDrawerStyles.sectionEyebrow}>Em andamento</p>
            <h3 className={notificationsDrawerStyles.sectionTitle}>Aviso in-app ativo</h3>
          </div>

          {activeInAppNotification ? (
            <article className={notificationsDrawerStyles.activeCard}>
              <div className={notificationsDrawerStyles.activeCopy}>
                <p className={notificationsDrawerStyles.activeTitle}>{activeInAppNotification.title}</p>
                <p className={notificationsDrawerStyles.activeMessage}>{activeInAppNotification.message}</p>
                <p className={notificationsDrawerStyles.meta}>
                  {new Date(activeInAppNotification.occurredAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <Button onClick={handleResolveActiveNotification} type="button" variant="outline">
                Marcar como resolvida
              </Button>
            </article>
          ) : (
            <EmptyState
              eyebrow="Inbox"
              title="Nenhum aviso in-app ativo"
              description="Quando o motor cair para entrega in-app, o aviso ativo aparece aqui com acao de resolucao."
              hint="Se a entrega estiver indo para o browser, o historico abaixo continua refletindo a reconciliacao recente."
            />
          )}
        </section>

        <section className={notificationsDrawerStyles.section}>
          <div className={notificationsDrawerStyles.sectionHeader}>
            <p className={notificationsDrawerStyles.sectionEyebrow}>Historico curto</p>
            <h3 className={notificationsDrawerStyles.sectionTitle}>Ultimos eventos reconciliados</h3>
          </div>

          {recentHistory.length > 0 ? (
            <div className={notificationsDrawerStyles.historyList}>
              {recentHistory.map((item) => (
                <article className={notificationsDrawerStyles.historyItem} key={item.eventId}>
                  <div className={notificationsDrawerStyles.historyRow}>
                    <p className={notificationsDrawerStyles.historyTitle}>{formatHistoryLabel(item)}</p>
                    <span className={notificationsDrawerStyles.historyStatus}>{formatHistoryStatus(item)}</span>
                  </div>
                  <p className={notificationsDrawerStyles.meta}>{new Date(item.occurredAt).toLocaleString('pt-BR')}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Historico"
              title="Nenhuma notificacao recente"
              description="O drawer abre corretamente agora, mas este navegador ainda nao registrou entregas, supressoes ou recoveries recentes."
              hint="Use o preview em configuracoes para popular esse historico com um evento real do motor."
            />
          )}
        </section>
      </div>
    </OverlayPanel>
  );
}