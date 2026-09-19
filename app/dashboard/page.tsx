import { redirect } from "next/navigation";
import { isAdmin } from "../../lib/admin-auth";
import { supabaseSelect } from "../../lib/supabase";
import DashboardClient from "./dashboard-client";

type Row = { id:string; folio:string; full_name:string; email:string; category:string; shirt_size:string; payment_status:string; race_time_ms:number|null; created_at:string };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  if (!await isAdmin()) redirect("/admin/login");
  let rows: Row[] = [];
  try { rows = await supabaseSelect<Row>("registrations", "select=id,folio,full_name,email,category,shirt_size,payment_status,race_time_ms,created_at&order=created_at.desc&limit=100"); }
  catch (error) { console.error(error); }
  return <DashboardClient rows={rows} admin="Administrador Nesport" />;
}
