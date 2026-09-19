import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseDelete, supabaseInsert, supabaseUpdate, uploadEventAsset } from "@/lib/supabase";

const imageFields = ["heroImage", "shirtImage", "bibImage", "medalImage", "kitImage"] as const;
const imageColumns: Record<(typeof imageFields)[number], string> = { heroImage:"hero_image", shirtImage:"shirt_image", bibImage:"bib_image", medalImage:"medal_image", kitImage:"kit_image" };

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await request.formData();
    const id = crypto.randomUUID();
    const title = String(form.get("title") || "").trim();
    if (!title) return NextResponse.json({ error: "Escribe el nombre de la carrera." }, { status: 400 });
    const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(0, 4)}`;
    const images: Record<string,string|null> = {};
    for (const field of imageFields) {
      const file = form.get(field);
      if (file instanceof File && file.size) {
        if (!file.type.startsWith("image/")) return NextResponse.json({ error: `${file.name} no es una imagen válida.` }, { status: 400 });
        if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: `${file.name} supera 6 MB.` }, { status: 400 });
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        images[imageColumns[field]] = await uploadEventAsset(`${id}/${field}-${safe}`, file);
      } else images[imageColumns[field]] = null;
    }
    await supabaseInsert("events", {
      id,title,slug,description:String(form.get("description")||""),location:String(form.get("location")||""),event_date:String(form.get("eventDate")||""),price:Number(form.get("price")),categories:String(form.get("categories")||""),includes:String(form.get("includes")||""),waiver:String(form.get("waiver")||""),privacy:String(form.get("privacy")||""),bank_name:String(form.get("bankName")||""),bank_holder:String(form.get("bankHolder")||""),bank_account:String(form.get("bankAccount")||""),bank_clabe:String(form.get("bankClabe")||""),status:String(form.get("status")||"published"),prizes:String(form.get("prizes")||""),faq:String(form.get("faq")||""),...images,
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
