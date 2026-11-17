export function safeCallbackUrl(value: unknown): string {
  const fallback = "/loans";
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback;
  }

  const base = "http://library.local";
  const target = new URL(value, base);
  if (target.origin !== base || target.pathname === "/login") return fallback;
  return target.pathname + target.search + target.hash;
}
