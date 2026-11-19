import { authorized, digest, json, readContent, runtime, sameOrigin } from '@/lib/server';
import { isEvent } from '@/lib/content';
export async function GET(req:Request){if(!await authorized(req))return json({error:'Inicia sesión.'},403);const cursor=new URL(req.url).searchParams.get('cursor')||undefined;const listed=await runtime().BUCKET.list({prefix:'signups/',limit:100,cursor});const rows=await Promise.all(listed.objects.map(async x=>{const item=await runtime().BUCKET.get(x.key);return item?.json();}));return json({rows:rows.filter(Boolean),cursor:listed.truncated?listed.cursor:null});}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Origen no permitido.'},403);
 if(Number(req.headers.get('content-length'))>4096)return json({error:'Solicitud demasiado grande.'},413);
 let fields:any;try{const raw=await req.text();if(raw.length>4096)throw 0;fields=JSON.parse(raw);}catch{return json({error:'Revisa el formulario.'},400);}
 if(fields.website)return json({ok:true});
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>=2&&v.length<=max;
 if(!text(fields.player,150)||!text(fields.contact,150)||!text(fields.email,200)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)||typeof fields.phone!=='string'||fields.phone.length>30||fields.accepted!==true)return json({error:'Revisa los datos de contacto y confirma la solicitud.'},400);
 const {data}=await readContent();const post=data.posts.find(p=>p.id===fields.postId&&p.published&&p.registrationOpen&&isEvent(p.category));if(!post||(post.endDate&&Date.parse(post.endDate)+86400000<Date.now()))return json({error:'Las inscripciones para esta actividad no están abiertas.'},400);
 const rateKey=`registration-limits/${await digest(req.headers.get('cf-connecting-ip')||'local')}`;const old=await runtime().BUCKET.get(rateKey);let limit=old?await old.json<{count:number;until:number}>():{count:0,until:0};if(limit.until<Date.now())limit={count:0,until:Date.now()+3600000};if(limit.count>=10)return json({error:'Has realizado varias solicitudes. Vuelve a intentarlo más tarde.'},429);
 const id=crypto.randomUUID();const row={id,postId:post.id,event:post.title,player:fields.player.trim(),contact:fields.contact.trim(),email:fields.email.trim(),phone:fields.phone.trim(),createdAt:new Date().toISOString(),status:'new'};
 await runtime().BUCKET.put(`signups/${id}.json`,JSON.stringify(row));await runtime().BUCKET.put(rateKey,JSON.stringify({...limit,count:limit.count+1}));return json({ok:true,id});
}
export async function PATCH(req:Request){if(!sameOrigin(req)||!await authorized(req))return json({error:'Inicia sesión.'},403);let fields:any;try{fields=await req.json();}catch{return json({error:'Solicitud no válida.'},400);}if(!/^[a-f0-9-]{36}$/.test(fields.id)||!['new','contacted','cancelled'].includes(fields.status))return json({error:'Estado no válido.'},400);const key=`signups/${fields.id}.json`;const item=await runtime().BUCKET.get(key);if(!item)return json({error:'Inscripción no encontrada.'},404);const row=await item.json<Record<string,unknown>>();await runtime().BUCKET.put(key,JSON.stringify({...row,status:fields.status}));return json({ok:true});}
