import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseUpdate } from "../../../../lib/supabase";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id, status, action } = await request.json();
  if(action==="deliver-kit"||action==="undo-kit"){
    const rows=await supabaseUpdate("registrations",`id=eq.${encodeURIComponent(id)}&payment_status=eq.approved`,action==="deliver-kit"?{kit_delivered_at:new Date().toISOString(),kit_delivered_by:"Nesport Admin"}:{kit_delivered_at:null,kit_delivered_by:null});
    if(!rows.length)return NextResponse.json({error:"Solo puedes entregar kits a corredores con pago aprobado."},{status:400});
    return NextResponse.json({ok:true,kit_delivered_at:(rows[0] as {kit_delivered_at?:string|null}).kit_delivered_at??null});
  }
  if (!["approved", "rejected"].includes(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  const rows=await supabaseUpdate("registrations", `id=eq.${encodeURIComponent(id)}`, { payment_status: status });
  const updated=rows[0] as {folio?:string|null}|undefined;
  return NextResponse.json({ ok: true, folio:updated?.folio??null });
}
