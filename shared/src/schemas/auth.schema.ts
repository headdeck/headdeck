import {z} from "zod";

export const LoginSchema = z.object({
    apiKey: z.string().trim().min(1, "API key is required"),
});

export type Login = z.infer<typeof LoginSchema>;