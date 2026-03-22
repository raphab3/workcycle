import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Use um email valido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
});

export const registerFormSchema = z.object({
  displayName: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
  email: z.string().email('Use um email valido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;