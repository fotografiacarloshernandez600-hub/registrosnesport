import { NextResponse } from "next/server";
import { supabaseInsert } from "../../../lib/supabase";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const secret=process.env.SUPABASE_SECRET_KEY;
    const storageUrl=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL;
    if(!secret||!storageUrl)throw new Error("Storage no configurado");
    const eventId=String(form.get("eventId")||"");
    async function checkTicket(kind:string){
      const ticket=String(form.get(kind==="receipt"?"receiptTicket":"marketingPhotoTicket")||"");
      const [encoded,sig]=ticket.split(".");
      if(!encoded||!sig||!/^[0-9a-f]{64}$/.test(sig))throw new Error("Carga de archivo inválida");
      const payload=Buffer.from(encoded,"base64url").toString();
      const expected=createHmac("sha256",secret!).update(payload).digest("hex");
      if(!timingSafeEqual(Buffer.from(sig,"hex"),Buffer.from(expected,"hex")))throw new Error("Firma de carga inválida");
      const [ev,k,bucket,path,mime,size,expires]=payload.split("|");
      if(ev!==eventId||k!==kind||Date.now()>Number(expires)||!path||!bucket)throw new Error("La carga expiró o no corresponde a esta carrera");
      const r=await fetch(`${storageUrl}/storage/v1/object/info/${bucket}/${path}`,{headers:{apikey:secret!,Authorization:`Bearer ${secret!}`}});
      if(!r.ok)throw new Error("Archivo no encontrado en Supabase");
      const info=await r.json() as {metadata?:{size?:number;mimetype?:string}};
      if(info.metadata?.size!=null&&Number(info.metadata.size)!==Number(size))throw new Error("Tamaño de archivo incorrecto");
      return {bucket,path,mime};
    }
    const receipt=await checkTicket("receipt");
    const marketingConsent=form.get("marketingPhotoConsent")==="yes";
    const hasPhoto=Boolean(form.get("marketingPhotoTicket"));
    if(hasPhoto&&!marketingConsent)return NextResponse.json({error:"Debes autorizar el uso de la foto promocional"},{status:400});
    const photo=hasPhoto?await checkTicket("marketingPhoto"):null;
    const required = ["eventId", "fullName", "email", "phone", "birthDate", "gender", "category", "shirtSize", "city", "emergencyName", "emergencyPhone"];
    for (const field of required) if (!String(form.get(field) || "").trim()) return NextResponse.json({ error: "Completa todos los datos obligatorios." }, { status: 400 });
    if (form.get("waiverAccepted") !== "yes") return NextResponse.json({ error: "Debes aceptar la responsiva y el aviso de privacidad." }, { status: 400 });
    const id = crypto.randomUUID();
    const receiptKey=receipt.path;
    const marketingPhotoUrl=photo?`${storageUrl}/storage/v1/object/public/${photo.bucket}/${photo.path}`:null;
    await supabaseInsert("registrations", {
      id, event_id: String(form.get("eventId")), full_name: String(form.get("fullName")), email: String(form.get("email")).toLowerCase(),
      phone: String(form.get("phone")), birth_date: String(form.get("birthDate")), gender: String(form.get("gender")), category: String(form.get("category")),
      shirt_size: String(form.get("shirtSize")), city: String(form.get("city")), club: String(form.get("club") || ""), emergency_name: String(form.get("emergencyName")),
      emergency_phone: String(form.get("emergencyPhone")), receipt_key: receiptKey, payment_status: "pending", marketing_photo_url: marketingPhotoUrl, marketing_photo_consent: marketingConsent && hasPhoto,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const message=error instanceof Error?error.message:"Error inesperado";
    return NextResponse.json({error: /duplicate key|registrations_event_identity_unique/i.test(message)?"Este atleta ya tiene una inscripción en esta carrera.":/cupos|no admite inscripciones/i.test(message)?message:"No pudimos guardar el registro. Verifica si ya se guardó antes de reintentar."},{status:/duplicate key|registrations_event_identity_unique|cupos|no admite inscripciones/i.test(message)?409:500});
  }
}
