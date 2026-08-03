import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const registerSchema = z
  .object({
    email: z.string().trim().email("Введите корректный email"),
    password: z.string().min(10, "Минимум 10 символов"),
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine(Boolean, "Подтвердите право на загружаемые материалы"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(10, "Минимум 10 символов"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
