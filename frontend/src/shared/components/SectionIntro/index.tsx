import type { SectionIntroProps } from './types';
import { sectionIntroStyles } from './styles';

export function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <header className={sectionIntroStyles.wrapper}>
      <p className={sectionIntroStyles.eyebrow}>{eyebrow}</p>
      <h1 className={sectionIntroStyles.title}>{title}</h1>
      <p className={sectionIntroStyles.description}>{description}</p>
    </header>
  );
}