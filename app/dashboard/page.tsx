import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";

export type AdminRegistration={id:string;event_id:string;folio:string|null;full_name:string;email:string;phone:string;category:string;shirt_size:string;payment_status:string;receipt_key:string;race_time_ms:number|null;created_at:string};
export type AdminEvent={id:string;title:string;slug:string;event_date:string;location:string;status:string;price:number;hero_image:string|null};
export type AdminPortfolio={id:string;category:string;title:string;description:string|null;image_url:string;sort_order:number};
export type AdminQuote={id:string;full_name:string;organization:string|null;phone:string;email:string;city:string;event_type:string;estimated_runners:number;target_date:string|null;services:string;details:string|null;status:string;created_at:string};
export const dynamic="force-dynamic";

export default async function Dashboard(){
  if(!await isAdmin())redirect("/admin/login");
  let rows:AdminRegistration[]=[],events:AdminEvent[]=[],portfolio:AdminPortfolio[]=[],quotes:AdminQuote[]=[],connectionError="";
  try{
    [rows,events,portfolio,quotes]=await Promise.all([
      supabaseSelect<AdminRegistration>("registrations","select=id,event_id,folio,full_name,email,phone,category,shirt_size,payment_status,receipt_key,race_time_ms,created_at&order=created_at.desc&limit=500"),
      supabaseSelect<AdminEvent>("events","select=id,title,slug,event_date,location,status,price,hero_image&order=event_date.desc"),
      supabaseSelect<AdminPortfolio>("portfolio_items","select=id,category,title,description,image_url,sort_order&order=sort_order.asc,created_at.desc"),
      supabaseSelect<AdminQuote>("quote_requests","select=id,full_name,organization,phone,email,city,event_type,estimated_runners,target_date,services,details,status,created_at&order=created_at.desc")
    ]);
  }catch(error){connectionError=error instanceof Error?error.message:"No fue posible conectar con Supabase";}
  return <DashboardClient rows={rows} events={events} portfolio={portfolio} quotes={quotes} connectionError={connectionError}/>;
}
