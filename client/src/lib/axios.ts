import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const pathname = globalThis.location.pathname;
    const pathParts = pathname.split("/");
    const firstPart = pathParts[1];

    const excludedPaths = ["", "login", 'register', "organizations"];

    if (firstPart && !excludedPaths.includes(firstPart)) {
        config.headers["x-tenant-slug"] = firstPart;
    }

    return config
})

export default api;