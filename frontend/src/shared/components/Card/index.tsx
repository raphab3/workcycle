import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

import { cardStyles } from './styles';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <article className={cn(cardStyles.root, className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <header className={cn(cardStyles.header, className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(cardStyles.title, className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(cardStyles.description, className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardStyles.content, className)} {...props} />;
}