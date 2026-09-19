import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseDelete, supabaseInsert, supabaseUpdate } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await request.formData();
    const id = crypto.randomUUID();
    const title = String(form.get("title") || "").trim();
    if (!title) return NextResponse.json({ error: "Escribe el nombre de la carrera." }, { status: 400 });
    const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(0, 4)}`;
    await supabaseInsert("events", {
      id,title,slug,description:String(form.get("description")||""),location:String(form.get("location")||""),event_date:String(form.get("eventDate")||""),price:Number(form.get("price")),categories:String(form.get("categories")||""),includes:String(form.get("includes")||""),waiver:String(form.get("waiver")||""),privacy:String(form.get("privacy")||""),bank_name:String(form.get("bankName")||""),bank_holder:String(form.get("bankHolder")||""),bank_account:String(form.get("bankAccount")||""),bank_clabe:String(form.get("bankClabe")||""),status:String(form.get("status")||"published"),prizes:String(form.get("prizes")||""),faq:String(form.get("faq")||""),hero_image:null,shirt_image:null,bib_image:null,medal_image:null,kit_image:null,
    });
    return NextResponse.json({ ok:true,id });
  } catch (error) {
    console.error(error);
    const detail = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error:`No se pudo crear la carrera. ${detail}` }, { status:500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error:"No autorizado" },{status:401});
  if ((request.headers.get("content-type")||"").includes("multipart/form-data")) {
    try {
      const form=await request.formData(),id=String(form.get("id")||"");
      if(!id)return NextResponse.json({error:"Falta la carrera"},{status:400});
      const values={title:String(form.get("title")||"").trim(),description:String(form.get("description")||""),location:String(form.get("location")||""),event_date:String(form.get("eventDate")||""),price:Number(form.get("price")),categories:String(form.get("categories")||""),includes:String(form.get("includes")||""),waiver:String(form.get("waiver")||""),privacy:String(form.get("privacy")||""),bank_name:String(form.get("bankName")||""),bank_holder:String(form.get("bankHolder")||""),bank_account:String(form.get("bankAccount")||""),bank_clabe:String(form.get("bankClabe")||""),status:String(form.get("status")||"draft"),prizes:String(form.get("prizes")||""),faq:String(form.get("faq")||"")};
      if(!values.title||!values.event_date||!values.location)return NextResponse.json({error:"Completa los datos obligatorios de la carrera."},{status:400});
      await supabaseUpdate("events",`id=eq.${encodeURIComponent(id)}`,values);
      return NextResponse.json({ok:true});
    }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No se pudo editar la carrera"},{status:500})}
  }
  const {id,status}=await request.json();
  if (!id || !["draft","published","coming_soon","closed"].includes(status)) return NextResponse.json({error:"Datos inválidos"},{status:400});
  await supabaseUpdate("events",`id=eq.${encodeURIComponent(id)}`,{status});
  return NextResponse.json({ok:true});
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error:"No autorizado" },{status:401});
  const {id}=await request.json();
  if (!id) return NextResponse.json({error:"Falta el evento"},{status:400});
  try { await supabaseDelete("events",`id=eq.${encodeURIComponent(id)}`); return NextResponse.json({ok:true}); }
  catch { return NextResponse.json({error:"No se puede eliminar una carrera con participantes. Puedes cerrarla."},{status:409}); }
}
