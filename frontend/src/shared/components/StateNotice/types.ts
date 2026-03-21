export type StateNoticeTone = 'info' | 'warning';

export interface StateNoticeProps {
  eyebrow: string;
  title: string;
  description: string;
  tone?: StateNoticeTone;
}