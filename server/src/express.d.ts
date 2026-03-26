declare namespace Express {
    interface Request {
        session?: { userId: string; email: string};
        tenant?: { orgId: string; role: "ADMIN" | "ENGINEER" | "CLIENT" };
        project?: { id: string };
    }
}
