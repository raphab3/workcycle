import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/utils/cn';

import { buttonVariants } from './styles';
import type { ButtonProps } from './types';

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return <Component className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}