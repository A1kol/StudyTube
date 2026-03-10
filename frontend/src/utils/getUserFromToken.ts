export function getUserFromToken(): string {
  if (typeof window === "undefined") return "User";

  const token = localStorage.getItem("token");
  if (!token) return "User";

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    return payload.sub || "User";
  } catch (e) {
    console.error("Token parse error", e);
    return "User";
  }
}