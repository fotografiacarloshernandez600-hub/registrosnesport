import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { supabaseInsert } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const form = await request.formData();
    const id = crypto.randomUUID();
    const title = String(form.get("title"));
    const slug = `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id.slice(0, 4)}`;
    await supabaseInsert("events", { id, title, slug, description: String(form.get("description")), location: String(form.get("location")), event_date: String(form.get("eventDate")), price: Number(form.get("price")), categories: String(form.get("categories")), includes: String(form.get("includes")), waiver: String(form.get("waiver")), privacy: String(form.get("privacy")), bank_name: String(form.get("bankName")), bank_holder: String(form.get("bankHolder")), bank_account: String(form.get("bankAccount")), bank_clabe: String(form.get("bankClabe")), status: "published" });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear" }, { status: 500 });
  }
}
