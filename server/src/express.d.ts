declare namespace Express {
    interface Request {
        session?: { userId: string; };
        tenant?: { orgId: string; role: "ADMIN" | "ENGINEER" | "CLIENT" };
        project?: { id: string };
    }
}
