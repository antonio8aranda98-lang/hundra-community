import { authorized, json, readContent, runtime, sameOrigin } from '@/lib/server';
import { categories, safeURL, type Content } from '@/lib/content';
export async function GET(req: Request) { try { const {data,etag}=await readContent(); if(!await authorized(req)){data.posts=data.posts.filter(p=>p.published).map(p=>({...p,registrationOpen:false,url:''}));data.settings={...data.settings,whatsapp:''};} return json({...data,revision:etag},200,{ETag:`"${etag}"`}); }catch { return json({error:'No se ha podido cargar el contenido. Inténtalo de nuevo.'},503); } }
export async function PUT(req: Request) {
 if(!sameOrigin(req)||!await authorized(req))return json({error:'Inicia sesión para editar.'},403);
 if(Number(req.headers.get('content-length'))>1000000)return json({error:'Contenido demasiado grande.'},413);
 let data:Content; try { const raw=await req.text(); if(raw.length>1000000)throw 0; data=JSON.parse(raw); }catch { return json({error:'Contenido no válido.'},400); }
 if(!data||typeof data!=='object')return json({error:'Contenido no válido.'},400);
 const suppliedRevision=(data as Content & {_revision?:string})._revision;data={settings:data.settings,posts:data.posts};
 const validText=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max;
 if(!data.settings||!Array.isArray(data.posts)||data.posts.length>1000||!validText(data.settings.welcome,150)||!validText(data.settings.introduction,1000)||!validText(data.settings.whatsapp,20)||!/^\d{0,15}$/.test(data.settings.whatsapp)||!validText(data.settings.contactEmail,150)||(data.settings.coverImage!==undefined&&(!validText(data.settings.coverImage,200)||(data.settings.coverImage&&!/^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(data.settings.coverImage)))))return json({error:'Revisa los ajustes y el número de WhatsApp (solo números).'},400);
 const ids=new Set();
 for(const p of data.posts){
  if(!p||!validText(p.id,50)||!p.id||ids.has(p.id)||!categories.some(c=>c.id===p.category)||!validText(p.title,180)||!p.title.trim()||!validText(p.summary,500)||!validText(p.body,30000)||!validText(p.player,150)||!validText(p.location,250)||!validText(p.image,200)||!validText(p.url,2000)||typeof p.published!=='boolean'||typeof p.featured!=='boolean'||typeof p.allDay!=='boolean'||typeof p.registrationOpen!=='boolean'||![p.date,p.endDate].every(d=>typeof d==='string'&&(!d||(!isNaN(Date.parse(d))&&d.length<40)))|| (p.url&&!safeURL(p.url)) || (p.image&&!/^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(p.image)) || (p.endDate&&(!p.date||Date.parse(p.endDate)<Date.parse(p.date))))return json({error:'Revisa los campos, los enlaces HTTPS y las fechas de las publicaciones.'},400);
  if((p.month!==undefined&&(!validText(p.month,7)||(p.month&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(p.month))))||(p.endMonth!==undefined&&(!validText(p.endMonth,7)||(p.endMonth&&(!p.month||!/^\d{4}-(0[1-9]|1[0-2])$/.test(p.endMonth)||p.endMonth<p.month)))))return json({error:'Revisa los meses previstos de las actividades.'},400);
  p.registrationOpen=false;
  ids.add(p.id);
 }
 const current=await readContent(); if((suppliedRevision??req.headers.get('if-match')?.replace(/^"|"$/g,''))!==current.etag)return json({error:'Hay cambios más recientes. Recarga el panel antes de guardar.'},409);
 await runtime().BUCKET.put(`history/${Date.now()}-${crypto.randomUUID()}.json`,JSON.stringify(current.data));
 const result=await runtime().BUCKET.put('content/current.json',JSON.stringify(data),{onlyIf:current.etag==='initial'?new Headers({'If-None-Match':'*'}):{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});
 return result?json({saved:true,revision:result.etag},200,{ETag:`"${result.etag}"`}):json({error:'Otro cambio se guardó primero. Recarga el panel.'},409);
}
