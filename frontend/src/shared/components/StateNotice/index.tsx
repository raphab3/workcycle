import { cn } from '@/shared/utils/cn';

import { stateNoticeStyles } from './styles';
import type { StateNoticeProps } from './types';

export function StateNotice({ eyebrow, title, description, tone = 'info' }: StateNoticeProps) {
  return (
    <section
      aria-live="polite"
      className={cn(
        stateNoticeStyles.container,
        tone === 'info' ? stateNoticeStyles.info : stateNoticeStyles.warning,
      )}
      role="status"
    >
      <p className={stateNoticeStyles.eyebrow}>{eyebrow}</p>
      <h2 className={stateNoticeStyles.title}>{title}</h2>
      <p className={stateNoticeStyles.description}>{description}</p>
    </section>
  );
}