import axios from "axios"

export const API_URL =
    import.meta.env.PROD
        ? "/api"
        : import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ||
          "http://localhost:5000"

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const { pathname } = globalThis.location;
    const parts = pathname.split("/").filter(Boolean); 

    if (parts[0] && !["login", "register", "organizations"].includes(parts[0])) {
        config.headers["x-tenant-slug"] = parts[0];

        const reservedKeywords = ["settings", "engineers", "clients", "projects", "catalogue", "notifications"];
        if (parts[1] && !reservedKeywords.includes(parts[1])) {
            config.headers["x-project-slug"] = parts[1];
        }
    }

    return config
})

export default api;
