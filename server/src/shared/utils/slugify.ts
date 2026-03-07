export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replaceAll('&', "-and-")
        .replaceAll(/[^a-z0-9\s-]/g, "")
        .replaceAll(/\s+/g, "-")
        .replaceAll(/-+/g, "-");
}