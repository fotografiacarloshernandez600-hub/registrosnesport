import { cookies } from "next/headers";

const COOKIE = "nesport_admin";

async function signature(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signed), b => b.toString(16).padStart(2, "0")).join("");
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, received] = value.split(".");
  if (!expires || !received || Number(expires) < Date.now()) return false;
  return received === await signature(expires);
}

export async function createAdminSession() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  (await cookies()).set(COOKIE, `${expires}.${await signature(expires)}`, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}
