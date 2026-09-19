import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-auth";
export async function POST(request: Request) {
  const data = await request.formData();
  if (!process.env.ADMIN_PASSWORD || String(data.get("password") || "") !== process.env.ADMIN_PASSWORD) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  await createAdminSession();
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
