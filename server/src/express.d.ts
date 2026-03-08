declare namespace Express {
    interface Request {
        session?: { userId: string; userAgent: string };
        tenant?: { orgId: string; role: "ADMIN" | "ENGINEER" | "CLIENT" };
    }
}
