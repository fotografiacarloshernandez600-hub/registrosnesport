import { NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
const url=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
export async function POST(request:Request){
 try {
  if(!url||!secret) throw new Error("Storage no configurado");
  const {kind,mime,size,eventId}=await request.json();
  if(!/^[0-9a-f-]{36}$/i.test(String(eventId))) return NextResponse.json({error:"Carrera inválida"},{status:400});
  const eventResponse=await fetch(`${url}/rest/v1/events?select=id,status&id=eq.${encodeURIComponent(String(eventId))}&limit=1`,{headers:{apikey:secret,Authorization:`Bearer ${secret}`}});
  if(!eventResponse.ok)throw new Error("No se pudo comprobar la carrera");
  const events=await eventResponse.json() as {id:string;status:string}[];
  if(events[0]?.status!=="published")return NextResponse.json({error:"La carrera no tiene inscripciones abiertas"},{status:409});
  const allowed=kind==="receipt"?["image/jpeg","image/png","application/pdf"]:kind==="marketingPhoto"?["image/jpeg","image/png","image/webp"]:[];
  if(!allowed.includes(mime)||!Number.isInteger(size)||size<1||size>5*1024*1024)return NextResponse.json({error:"Archivo no permitido o mayor a 5 MB"},{status:400});
  const ext= mime==="application/pdf"?"pdf":mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
  const id=randomUUID();const bucket=kind==="receipt"?(process.env.SUPABASE_RECEIPTS_BUCKET??"payment-receipts"):(process.env.SUPABASE_EVENT_ASSETS_BUCKET??"event-assets");
  const path=kind==="receipt"?`registrations/${id}.${ext}`:`welcome/${id}.${ext}`;
  const response=await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${path}`,{method:"POST",headers:{apikey:secret,Authorization:`Bearer ${secret}`,"content-type":"application/json"},body:JSON.stringify({upsert:false})});
  if(!response.ok)throw new Error(`No se pudo preparar la carga (${response.status})`);
  const result=await response.json() as {url?:string;token?:string};
  const uploadUrl=result.url?.startsWith("http")?result.url:`${url}/storage/v1${result.url}`;
  if(!result.url||!uploadUrl.startsWith(`${url}/storage/v1/`))throw new Error("Respuesta de almacenamiento inválida");
  const expires=Date.now()+15*60*1000;
  const payload=[eventId,kind,bucket,path,mime,String(size),String(expires)].join("|");
  const sig=createHmac("sha256",secret).update(payload).digest("hex");
  return NextResponse.json({uploadUrl,receiptKey:kind==="receipt"?path:undefined,photoPath:kind==="marketingPhoto"?path:undefined,ticket:Buffer.from(payload).toString("base64url")+"."+sig});
 }catch(error){console.error(error);return NextResponse.json({error:"No se pudo preparar la carga"},{status:500})}
}
