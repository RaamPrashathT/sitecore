declare namespace Express {
    interface Request {
        session?: { userId: string; email: string, username: string, onboarded: boolean , tenant: Record<string, { id: string; role: string }>};
        tenant?: { orgId: string; role: "ADMIN" | "ENGINEER" | "CLIENT" };
        project?: { id: string };
    }
}
