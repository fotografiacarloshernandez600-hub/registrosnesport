import{NextResponse}from"next/server";
import{isAdmin}from"@/lib/admin-auth";
import{supabaseUpdate,uploadEventAsset}from"@/lib/supabase";

const columns:Record<string,string>={heroImage:"hero_image",shirtImage:"shirt_image",bibImage:"bib_image",medalImage:"medal_image",kitImage:"kit_image"};
export async function POST(request:Request){
 if(!await isAdmin())return NextResponse.json({error:"No autorizado"},{status:401});
 try{
  const form=await request.formData(),eventId=String(form.get("eventId")||""),kind=String(form.get("kind")||""),file=form.get("file");
  if(!eventId||!columns[kind]||!(file instanceof File)||!file.size)return NextResponse.json({error:"Imagen incompleta"},{status:400});
  if(!file.type.startsWith("image/"))return NextResponse.json({error:"El archivo debe ser una imagen"},{status:400});
  if(file.size>4*1024*1024)return NextResponse.json({error:`${file.name} supera 4 MB`},{status:400});
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const imageUrl=await uploadEventAsset(`${eventId}/${kind}-${crypto.randomUUID()}-${safe}`,file);
  await supabaseUpdate("events",`id=eq.${encodeURIComponent(eventId)}`,{[columns[kind]]:imageUrl});
  return NextResponse.json({ok:true,imageUrl});
 }catch(error){const detail=error instanceof Error?error.message:"Error desconocido";return NextResponse.json({error:`No se pudo subir la imagen. ${detail}`},{status:500})}
}
