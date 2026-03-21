import type { EmptyStateProps } from './types';
import { emptyStateStyles } from './styles';

export function EmptyState({ eyebrow, title, description, hint }: EmptyStateProps) {
  return (
    <section className={emptyStateStyles.container}>
      <p className={emptyStateStyles.eyebrow}>{eyebrow}</p>
      <h2 className={emptyStateStyles.title}>{title}</h2>
      <p className={emptyStateStyles.description}>{description}</p>
      <p className={emptyStateStyles.hint}>{hint}</p>
    </section>
  );
}