import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseDelete, supabaseSelect, supabaseUpdate } from "@/lib/supabase";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const photos = await supabaseSelect(
      "event_photos",
      "select=id,event_id,participant_name,caption,image_url,status,created_at&order=created_at.desc&limit=500",
    );
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar las fotos de participantes." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id, status } = await request.json();
    if (!id || !["approved", "rejected"].includes(status))
      return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    await supabaseUpdate("event_photos", `id=eq.${encodeURIComponent(id)}`, { status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la fotografía." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Falta la fotografía." }, { status: 400 });
    await supabaseDelete("event_photos", `id=eq.${encodeURIComponent(id)}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la fotografía." }, { status: 500 });
  }
}
