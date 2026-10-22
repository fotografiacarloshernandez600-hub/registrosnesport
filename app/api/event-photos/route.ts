import { NextResponse } from "next/server";
import { supabaseInsert, supabaseSelect, uploadEventAsset } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "Falta la carrera." }, { status: 400 });
  try {
    const eventRows = await supabaseSelect<{event_date:string}>("events", `select=event_date&id=eq.${encodeURIComponent(eventId)}&limit=1`);
    if (!eventRows.length || new Date(eventRows[0].event_date).getTime() + 12 * 60 * 60 * 1000 >= Date.now()) return NextResponse.json({ photos: [] });
    const photos = await supabaseSelect<{id:string;participant_name:string;caption:string|null;image_url:string;created_at:string}>(
      "event_photos",
      `select=id,participant_name,caption,image_url,created_at&event_id=eq.${encodeURIComponent(eventId)}&status=eq.approved&order=created_at.desc&limit=100`,
    );
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las fotografías." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const eventId = String(form.get("eventId") || "").trim();
    const participantName = String(form.get("participantName") || "").trim().slice(0, 100);
    const caption = String(form.get("caption") || "").trim().slice(0, 240);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const phone = String(form.get("phone") || "").replace(/\D/g, "");
    const file = form.get("file");
    if (!eventId || !participantName || !email || phone.length < 10 || form.get("photoConsent") !== "yes" || !(file instanceof File) || !file.size)
      return NextResponse.json({ error: "Completa tu nombre, acepta la autorización y adjunta una fotografía." }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 6 * 1024 * 1024)
      return NextResponse.json({ error: "La foto debe ser JPG, PNG o WebP de máximo 6 MB." }, { status: 400 });
    const events = await supabaseSelect<{id:string;status:string;event_date:string}>(
      "events", `select=id,status,event_date&id=eq.${encodeURIComponent(eventId)}&limit=1`,
    );
    if (!events.length || new Date(events[0].event_date).getTime() + 12 * 60 * 60 * 1000 >= Date.now())
      return NextResponse.json({ error: "La galería se habilitará después de la fecha de la carrera." }, { status: 403 });
    const registrations = await supabaseSelect<{id:string;email:string;phone:string}>("registrations", `select=id,email,phone&event_id=eq.${encodeURIComponent(eventId)}&payment_status=eq.approved&limit=1000`);
    if (!registrations.some((registration) => registration.email.trim().toLowerCase() === email && registration.phone.replace(/\D/g, "").slice(-10) === phone.slice(-10))) return NextResponse.json({ error: "No encontramos una inscripción pagada para esa carrera con esos datos. Revisa tu correo y WhatsApp." }, { status: 403 });
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "foto";
    const imageUrl = await uploadEventAsset(`participant-photos/${eventId}/${id}-${safeName}`, file);
    await supabaseInsert("event_photos", {
      id, event_id: eventId, participant_name: participantName,
      caption, image_url: imageUrl, status: "pending",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("event photo upload failed", error);
    return NextResponse.json({ error: "No se pudo enviar la fotografía. Intenta de nuevo." }, { status: 500 });
  }
}
