import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseUpdate, supabaseDelete, supabaseSelect } from "../../../../lib/supabase";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body=await request.json();
  const { id, status, action } = body;
  if(action==="edit-runner"){
    const allowed={full_name:String(body.fullName||"").trim(),email:String(body.email||"").trim().toLowerCase(),phone:String(body.phone||"").trim(),birth_date:String(body.birthDate||""),gender:String(body.gender||""),category:String(body.category||""),shirt_size:String(body.shirtSize||""),city:String(body.city||""),club:String(body.club||""),emergency_name:String(body.emergencyName||""),emergency_phone:String(body.emergencyPhone||""),payment_status:String(body.paymentStatus||"pending")};
    if(!allowed.full_name||!allowed.email||!allowed.phone)return NextResponse.json({error:"Nombre, correo y teléfono son obligatorios."},{status:400});
    const rows=await supabaseUpdate("registrations",`id=eq.${encodeURIComponent(id)}`,allowed.payment_status==="approved"?allowed:{...allowed,folio:null});
    return NextResponse.json({ok:true,row:rows[0]});
  }
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

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({error:"No autorizado"},{status:401});
  try {
    const {id}=await request.json();
    if(typeof id!=="string"||!id) return NextResponse.json({error:"ID inválido"},{status:400});
    const existing=await supabaseSelect<{id:string}>("registrations",`select=id&id=eq.${encodeURIComponent(id)}&limit=1`);
    if(!existing.length) return NextResponse.json({error:"El corredor ya no existe"},{status:404});
    await supabaseDelete("registrations",`id=eq.${encodeURIComponent(id)}`);
    const remaining=await supabaseSelect<{id:string}>("registrations",`select=id&id=eq.${encodeURIComponent(id)}&limit=1`);
    if(remaining.length) throw new Error("No se pudo confirmar la eliminación");
    return NextResponse.json({ok:true});
  } catch(error) {return NextResponse.json({error:error instanceof Error?error.message:"No se pudo eliminar"},{status:500});}
}
