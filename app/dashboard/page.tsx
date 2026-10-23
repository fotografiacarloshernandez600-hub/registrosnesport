import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { supabaseSelect } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";

export type AdminRegistration={id:string;event_id:string;folio:string|null;full_name:string;email:string;phone:string;birth_date:string;gender:string;category:string;shirt_size:string;city:string;club:string|null;emergency_name:string;emergency_phone:string;payment_status:string;receipt_key:string;marketing_photo_url:string|null;marketing_photo_consent:boolean;race_time_ms:number|null;kit_delivered_at:string|null;kit_delivered_by:string|null;created_at:string};
export type AdminSponsor={id:string;name:string;logo_url:string;sort_order:number;description:string|null};
export type AdminEvent={id:string;capacity:number|null;title:string;slug:string;description:string;event_date:string;location:string;status:string;price:number;categories:string;includes:string;waiver:string;privacy:string;bank_name:string;bank_holder:string;bank_account:string;bank_clabe:string;hero_image:string|null;event_logo:string|null;waiver_pdf:string|null;privacy_pdf:string|null;access_time:string|null;warmup_time:string|null;kit_pickup_info:string|null;payment_concept:string|null;shirt_image:string|null;bib_image:string|null;medal_image:string|null;kit_image:string|null;socks_image:string|null;prizes:string|null;faq:string|null;event_sponsors:AdminSponsor[]};
export type AdminPortfolio={id:string;category:string;title:string;description:string|null;image_url:string;sort_order:number};
export type AdminEventPhoto={id:string;event_id:string;participant_name:string;caption:string|null;image_url:string;status:string;created_at:string};
export type AdminQuote={id:string;full_name:string;organization:string|null;phone:string;email:string;city:string;event_type:string;estimated_runners:number;target_date:string|null;services:string;details:string|null;status:string;created_at:string};
export const dynamic="force-dynamic";

export default async function Dashboard(){
  if(!await isAdmin())redirect("/admin/login");
  let rows:AdminRegistration[]=[],events:AdminEvent[]=[],portfolio:AdminPortfolio[]=[],quotes:AdminQuote[]=[],eventPhotos:AdminEventPhoto[]=[],connectionError="";
  try{
    [rows,events,portfolio,quotes]=await Promise.all([
      supabaseSelect<AdminRegistration>("registrations","select=id,event_id,folio,full_name,email,phone,birth_date,gender,category,shirt_size,city,club,emergency_name,emergency_phone,payment_status,receipt_key,marketing_photo_url,marketing_photo_consent,race_time_ms,kit_delivered_at,kit_delivered_by,created_at&order=created_at.desc&limit=1000"),
      supabaseSelect<AdminEvent>("events","select=id,title,slug,capacity,description,event_date,location,status,price,categories,includes,waiver,privacy,bank_name,bank_holder,bank_account,bank_clabe,hero_image,event_logo,waiver_pdf,privacy_pdf,access_time,warmup_time,kit_pickup_info,payment_concept,shirt_image,bib_image,medal_image,kit_image,socks_image,prizes,faq,event_sponsors(id,name,logo_url,sort_order,description)&order=event_date.desc"),
      supabaseSelect<AdminPortfolio>("portfolio_items","select=id,category,title,description,image_url,sort_order&order=sort_order.asc,created_at.desc"),
      supabaseSelect<AdminQuote>("quote_requests","select=id,full_name,organization,phone,email,city,event_type,estimated_runners,target_date,services,details,status,created_at&order=created_at.desc")
    ]);
  }catch(error){connectionError=error instanceof Error?error.message:"No fue posible conectar con Supabase";}
  try { eventPhotos = await supabaseSelect<AdminEventPhoto>("event_photos","select=id,event_id,participant_name,caption,image_url,status,created_at&order=created_at.desc&limit=500"); } catch {}
  return <DashboardClient rows={rows} events={events} portfolio={portfolio} quotes={quotes} eventPhotos={eventPhotos} connectionError={connectionError}/>;
}
