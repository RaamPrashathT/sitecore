import { defineConfig } from "vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss()],
    build: {
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            onwarn(warning, defaultHandler) {
                if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                    return;
                }

                defaultHandler(warning);
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
