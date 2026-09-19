import{NextResponse}from"next/server";
import{supabaseInsert}from"@/lib/supabase";
export async function POST(request:Request){
 try{const body=await request.json();const required=["fullName","phone","email","city","eventType","estimatedRunners","services"];
  if(required.some(k=>!String(body[k]??"").trim()))return NextResponse.json({error:"Completa los datos obligatorios."},{status:400});
  await supabaseInsert("quote_requests",{full_name:String(body.fullName).trim(),organization:String(body.organization||"").trim(),phone:String(body.phone).trim(),email:String(body.email).trim().toLowerCase(),city:String(body.city).trim(),event_type:String(body.eventType),estimated_runners:Number(body.estimatedRunners),target_date:body.targetDate||null,services:Array.isArray(body.services)?body.services.join(", "):String(body.services),details:String(body.details||"").trim(),status:"new"});
  return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error instanceof Error?`No se pudo enviar. ${error.message}`:"No se pudo enviar la solicitud."},{status:500})}
}
