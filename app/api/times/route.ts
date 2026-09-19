import { NextResponse } from "next/server";
import { supabaseUpdate } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    const { folio, timeMs } = await request.json();
    if (!folio || !Number.isFinite(timeMs) || timeMs < 1000) return NextResponse.json({ error: "Datos de tiempo no válidos." }, { status: 400 });
    const rows = await supabaseUpdate("registrations", `folio=eq.${encodeURIComponent(String(folio).toUpperCase())}&payment_status=eq.approved`, { race_time_ms: Math.round(timeMs) });
    if (!rows.length) return NextResponse.json({ error: "Folio no encontrado o pago pendiente." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No fue posible guardar el tiempo." }, { status: 500 });
  }
}
