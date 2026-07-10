import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Client generation only needs a syntactically valid URL. Render supplies
        // the real DATABASE_URL for database commands and at runtime.
        url:
            process.env.DATABASE_URL ??
            "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    },
});
