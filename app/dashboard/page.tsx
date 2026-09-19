import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";

export type AdminRegistration={id:string;event_id:string;folio:string|null;full_name:string;email:string;phone:string;birth_date:string;gender:string;category:string;shirt_size:string;city:string;club:string|null;emergency_name:string;emergency_phone:string;payment_status:string;receipt_key:string;race_time_ms:number|null;kit_delivered_at:string|null;kit_delivered_by:string|null;created_at:string};
export type AdminSponsor={id:string;name:string;logo_url:string;sort_order:number};
export type AdminEvent={id:string;title:string;slug:string;description:string;event_date:string;location:string;status:string;price:number;categories:string;includes:string;waiver:string;privacy:string;bank_name:string;bank_holder:string;bank_account:string;bank_clabe:string;hero_image:string|null;shirt_image:string|null;bib_image:string|null;medal_image:string|null;kit_image:string|null;prizes:string|null;faq:string|null;event_sponsors:AdminSponsor[]};
export type AdminPortfolio={id:string;category:string;title:string;description:string|null;image_url:string;sort_order:number};
export type AdminQuote={id:string;full_name:string;organization:string|null;phone:string;email:string;city:string;event_type:string;estimated_runners:number;target_date:string|null;services:string;details:string|null;status:string;created_at:string};
export const dynamic="force-dynamic";

export default async function Dashboard(){
  if(!await isAdmin())redirect("/admin/login");
  let rows:AdminRegistration[]=[],events:AdminEvent[]=[],portfolio:AdminPortfolio[]=[],quotes:AdminQuote[]=[],connectionError="";
  try{
    [rows,events,portfolio,quotes]=await Promise.all([
      supabaseSelect<AdminRegistration>("registrations","select=id,event_id,folio,full_name,email,phone,birth_date,gender,category,shirt_size,city,club,emergency_name,emergency_phone,payment_status,receipt_key,race_time_ms,kit_delivered_at,kit_delivered_by,created_at&order=created_at.desc&limit=1000"),
      supabaseSelect<AdminEvent>("events","select=id,title,slug,description,event_date,location,status,price,categories,includes,waiver,privacy,bank_name,bank_holder,bank_account,bank_clabe,hero_image,shirt_image,bib_image,medal_image,kit_image,prizes,faq,event_sponsors(id,name,logo_url,sort_order)&order=event_date.desc"),
      supabaseSelect<AdminPortfolio>("portfolio_items","select=id,category,title,description,image_url,sort_order&order=sort_order.asc,created_at.desc"),
      supabaseSelect<AdminQuote>("quote_requests","select=id,full_name,organization,phone,email,city,event_type,estimated_runners,target_date,services,details,status,created_at&order=created_at.desc")
    ]);
  }catch(error){connectionError=error instanceof Error?error.message:"No fue posible conectar con Supabase";}
  return <DashboardClient rows={rows} events={events} portfolio={portfolio} quotes={quotes} connectionError={connectionError}/>;
}
