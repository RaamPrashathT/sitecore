import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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