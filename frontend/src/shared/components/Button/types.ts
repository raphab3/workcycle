import type { ButtonHTMLAttributes } from 'react';

import type { VariantProps } from 'class-variance-authority';

import type { buttonVariants } from './styles';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}