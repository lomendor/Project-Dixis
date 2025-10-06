import { z } from 'zod';
export const PhoneSchema = z.object({
  phone: z.string().trim().regex(/^\+?\d{10,15}$/, "Μη έγκυρος αριθμός τηλεφώνου")
});
export const OtpVerifySchema = z.object({
  phone: z.string().trim().regex(/^\+?\d{10,15}$/),
  code: z.string().trim().regex(/^\d{6}$/,"Ο κωδικός είναι 6 ψηφία")
});
