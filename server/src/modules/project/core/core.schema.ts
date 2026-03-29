import z from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    estimatedBudget: z.coerce.number(),
});

export const getProjectListSchema = z.object({
    organizationId: z.string().length(36),
    pageIndex: z.number().min(0),
    pageSize: z.number().min(1),
    searchQuery: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    estimatedBudget: z.coerce.number().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export const assignMemberSchema = z.object({
    userId: z.string().length(24), // Assuming MongoDB ObjectId 24-char hex
    role: z.enum(["ENGINEER", "CLIENT"]),
});

export const removeMemberSchema = z.object({
    userId: z.string().length(24),
});

export const createInviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ENGINEER", "CLIENT"]),
});