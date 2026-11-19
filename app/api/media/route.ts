import { authorized, json, runtime, sameOrigin } from '@/lib/server';
export async function POST(req: Request) {
 if(!sameOrigin(req)||!await authorized(req))return json({error:'Inicia sesión para subir imágenes.'},403);
 const max=4*1024*1024;if(Number(req.headers.get('content-length'))>max)return json({error:'La imagen debe ocupar menos de 4 MB.'},413);
 const reader=req.body?.getReader();if(!reader)return json({error:'Selecciona una imagen.'},400);const chunks:Uint8Array[]=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();return json({error:'La imagen debe ocupar menos de 4 MB.'},413);}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';const ext=png?'png':jpg?'jpg':webp?'webp':'';
 if(!ext)return json({error:'Usa una imagen PNG, JPG o WebP.'},400);
 const id=`${crypto.randomUUID()}.${ext}`;await runtime().BUCKET.put(`media/${id}`,bytes,{httpMetadata:{contentType:ext==='jpg'?'image/jpeg':`image/${ext}`}});return json({url:`/api/media/${id}`});
}
