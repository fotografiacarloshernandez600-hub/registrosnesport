import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";

export type AdminRegistration={id:string;event_id:string;folio:string;full_name:string;email:string;phone:string;category:string;shirt_size:string;payment_status:string;receipt_key:string;race_time_ms:number|null;created_at:string};
export type AdminEvent={id:string;title:string;slug:string;event_date:string;location:string;status:string;price:number;hero_image:string|null};
export const dynamic="force-dynamic";

export default async function Dashboard(){
  if(!await isAdmin())redirect("/admin/login");
  let rows:AdminRegistration[]=[],events:AdminEvent[]=[],connectionError="";
  try{
    [rows,events]=await Promise.all([
      supabaseSelect<AdminRegistration>("registrations","select=id,event_id,folio,full_name,email,phone,category,shirt_size,payment_status,receipt_key,race_time_ms,created_at&order=created_at.desc&limit=500"),
      supabaseSelect<AdminEvent>("events","select=id,title,slug,event_date,location,status,price,hero_image&order=event_date.desc")
    ]);
  }catch(error){connectionError=error instanceof Error?error.message:"No fue posible conectar con Supabase";}
  return <DashboardClient rows={rows} events={events} connectionError={connectionError}/>;
}
