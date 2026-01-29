import { z } from "zod";

export const riderSchema = z.object({
    id: z.number().optional(),
    pharmacy_id: z.coerce.number(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    is_active: z.boolean().default(true),
});

export type RiderFormValues = z.infer<typeof riderSchema>;
