import { authorized, digest, equal, json, runtime, sameOrigin, sessionCookie, sessionToken } from '@/lib/server';
export async function GET(req: Request) { return json({authenticated:await authorized(req)}); }
export async function POST(req: Request) {
 if(!sameOrigin(req)) return json({error:'Origen no permitido'},403);
 const {ADMIN_PASSWORD,BUCKET}=runtime(); if(!ADMIN_PASSWORD||!BUCKET) return json({error:'El acceso de edición todavía no está configurado.'},503);
 if(Number(req.headers.get('content-length'))>2048) return json({error:'Solicitud demasiado grande'},413);
 const key=`limits/${await digest(req.headers.get('cf-connecting-ip')||'local')}`; const stored=await BUCKET.get(key); let limit=stored?await stored.json<{count:number;until:number}>():{count:0,until:0}; if(limit.until<Date.now()) limit={count:0,until:Date.now()+15*60000};
 if(limit.count>=5) return json({error:'Demasiados intentos. Vuelve a intentarlo en 15 minutos.'},429);
 let password=''; try { password=(await req.json() as {password:string}).password; }catch { return json({error:'Solicitud no válida'},400); }
 if(typeof password!=='string'||password.length>256||!await equal(password,ADMIN_PASSWORD)){ await BUCKET.put(key,JSON.stringify({...limit,count:limit.count+1})); return json({error:'La contraseña no es correcta.'},401); }
 await BUCKET.delete(key); return json({authenticated:true},200,{'Set-Cookie':sessionCookie(req,await sessionToken())});
}
export async function DELETE(req: Request) { if(!sameOrigin(req))return json({error:'Origen no permitido'},403); return json({authenticated:false},200,{'Set-Cookie':sessionCookie(req,'',0)}); }
