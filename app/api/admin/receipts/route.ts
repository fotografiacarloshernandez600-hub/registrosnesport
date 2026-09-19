import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createReceiptUrl } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!await isAdmin()) return NextResponse.json({error:"No autorizado"},{status:401});
  const key = new URL(request.url).searchParams.get("key");
  if (!key || key.includes("..")) return NextResponse.json({error:"Comprobante inválido"},{status:400});
  try { return NextResponse.redirect(await createReceiptUrl(key)); }
  catch { return NextResponse.json({error:"No se pudo abrir el comprobante"},{status:500}); }
}
