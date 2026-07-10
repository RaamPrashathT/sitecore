const skippedRequestHeaders = new Set([
    "connection",
    "content-length",
    "host",
    "origin",
]);

const skippedResponseHeaders = new Set([
    "connection",
    "content-encoding",
    "content-length",
    "transfer-encoding",
]);

export default async function handler(request, response) {
    const backendUrl = (
        process.env.BACKEND_URL ?? "https://sitecore-asho.onrender.com"
    ).replace(/\/$/, "");

    const path = Array.isArray(request.query.path)
        ? request.query.path.join("/")
        : request.query.path;
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(request.query)) {
        if (key === "path" || value === undefined) continue;
        for (const item of Array.isArray(value) ? value : [value]) {
            searchParams.append(key, String(item));
        }
    }

    const target = `${backendUrl}/${path ?? ""}${searchParams.size ? `?${searchParams}` : ""}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
        if (skippedRequestHeaders.has(key.toLowerCase()) || value === undefined) continue;
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    let body;
    if (!['GET', 'HEAD'].includes(request.method ?? 'GET') && request.body !== undefined) {
        body = Buffer.isBuffer(request.body)
            ? request.body
            : typeof request.body === "string"
              ? request.body
              : JSON.stringify(request.body);
    }

    try {
        const upstream = await fetch(target, {
            method: request.method,
            headers,
            body,
            redirect: "manual",
        });

        for (const [key, value] of upstream.headers.entries()) {
            if (!skippedResponseHeaders.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
                response.setHeader(key, value);
            }
        }

        const cookies = upstream.headers.getSetCookie?.() ?? [];
        if (cookies.length) response.setHeader("set-cookie", cookies);

        const payload = Buffer.from(await upstream.arrayBuffer());
        return response.status(upstream.status).send(payload);
    } catch (error) {
        console.error("Backend proxy failed", error);
        return response.status(502).json({ message: "Backend is unavailable" });
    }
}
