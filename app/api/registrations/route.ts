import { NextResponse } from "next/server";
import { supabaseInsert, uploadReceipt } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("receipt");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Adjunta tu comprobante de pago." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "El comprobante supera 5 MB." }, { status: 400 });
    if (![/^image\//, /^application\/pdf$/].some(type => type.test(file.type))) return NextResponse.json({ error: "El comprobante debe ser una imagen o PDF." }, { status: 400 });
    const required = ["eventId", "fullName", "email", "phone", "birthDate", "gender", "category", "shirtSize", "city", "emergencyName", "emergencyPhone"];
    for (const field of required) if (!String(form.get(field) || "").trim()) return NextResponse.json({ error: "Completa todos los datos obligatorios." }, { status: 400 });
    if (form.get("waiverAccepted") !== "yes") return NextResponse.json({ error: "Debes aceptar la responsiva y el aviso de privacidad." }, { status: 400 });
    const id = crypto.randomUUID();
    const folio = `NES-${new Date().getFullYear()}-${id.slice(0, 6).toUpperCase()}`;
    const receiptKey = `${id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await uploadReceipt(receiptKey, file);
    await supabaseInsert("registrations", {
      id, event_id: String(form.get("eventId")), folio, full_name: String(form.get("fullName")), email: String(form.get("email")).toLowerCase(),
      phone: String(form.get("phone")), birth_date: String(form.get("birthDate")), gender: String(form.get("gender")), category: String(form.get("category")),
      shirt_size: String(form.get("shirtSize")), city: String(form.get("city")), club: String(form.get("club") || ""), emergency_name: String(form.get("emergencyName")),
      emergency_phone: String(form.get("emergencyPhone")), receipt_key: receiptKey, payment_status: "pending",
    });
    return NextResponse.json({ ok: true, folio });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No pudimos guardar el registro. Intenta nuevamente." }, { status: 500 });
  }
}
