import { z } from "zod";

// Greek phone validation (transforms and validates)
const grPhone = z
  .string()
  .transform(s => s.replace(/\s+/g, ''))
  .refine(
    s => /^\+?30\d{10}$/.test(s) || /^0\d{9}$/.test(s),
    { message: "Έγκυρο ελληνικό τηλέφωνο (+30… ή 0…)" }
  );

// Greek postal code (5 digits)
const postal5 = z
  .string()
  .regex(/^\d{5}$/, "Έγκυρος Τ.Κ. (5 ψηφία)");

// Checkout schema with Greek-first error messages
export const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "ID προϊόντος απαιτείται"),
        qty: z.number().int().positive("Ποσότητα πρέπει να είναι θετική"),
        price: z.number().nonnegative().optional()
      })
    )
    .min(1, "Το καλάθι είναι άδειο"),

  shipping: z.object({
    name: z.string().min(2, "Συμπλήρωσε το ονοματεπώνυμο"),
    line1: z.string().min(3, "Συμπλήρωσε τη διεύθυνση"),
    line2: z.string().optional(),
    city: z.string().min(2, "Συμπλήρωσε την πόλη"),
    postal: postal5,
    phone: grPhone,
    email: z.string().email("Έγκυρο email").optional().or(z.literal('')),
    method: z.enum(["PICKUP", "COURIER", "COURIER_COD"]).default("COURIER")
  }),

  payment: z.object({
    method: z.enum(["COD", "CARD", "BANK"]).default("COD")
  })
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
