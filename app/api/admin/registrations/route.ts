import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseUpdate } from "../../../../lib/supabase";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, status } = await request.json();
  if (!["approved", "rejected"].includes(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  const rows=await supabaseUpdate("registrations", `id=eq.${encodeURIComponent(id)}`, { payment_status: status });
  const updated=rows[0] as {folio?:string|null}|undefined;
  return NextResponse.json({ ok: true, folio:updated?.folio??null });
}
