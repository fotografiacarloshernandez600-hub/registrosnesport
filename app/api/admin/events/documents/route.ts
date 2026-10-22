import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseUpdate, uploadEventAsset } from "@/lib/supabase";
const columns: Record<string,string> = { waiverPdf: "waiver_pdf", privacyPdf: "privacy_pdf" };
export async function POST(request: Request) {
 if (!await isAdmin()) return NextResponse.json({error:"No autorizado"},{status:401});
 try {
  const form=await request.formData(),eventId=String(form.get("eventId")||""),kind=String(form.get("kind")||""),file=form.get("file");
  if(!eventId||!columns[kind]||!(file instanceof File)||!file.size) return NextResponse.json({error:"Selecciona un PDF válido."},{status:400});
  if(file.type!=="application/pdf"||file.size>12*1024*1024) return NextResponse.json({error:"El documento debe ser PDF y pesar máximo 12 MB."},{status:400});
  const name=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const url=await uploadEventAsset(`${eventId}/documents/${kind}-${crypto.randomUUID()}-${name}`,file);
  await supabaseUpdate("events",`id=eq.${encodeURIComponent(eventId)}`,{[columns[kind]]:url});
  return NextResponse.json({ok:true,url});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"No se pudo subir el documento."},{status:500}); }
}
