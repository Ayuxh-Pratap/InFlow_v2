import { z } from "zod";

export const nameSchema = z
    .string()
    .trim()
    .min(1, "Name must be at least 1 characters long")
    .max(255);

export const descriptionSchema = z
    .string()
    .trim()
    .optional()

export const createWorkspaceSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});