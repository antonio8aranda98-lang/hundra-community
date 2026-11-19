import { isEvent, type Post } from './content';
export const SEASON_START='2026-09-01';
export const SEASON_END='2027-08-31';
export const seasonMonths=Array.from({length:12},(_,i)=>{const date=new Date(Date.UTC(2026,8+i,1));return {year:date.getUTCFullYear(),month:date.getUTCMonth(),key:date.toISOString().slice(0,7),name:new Intl.DateTimeFormat('es-ES',{month:'long',timeZone:'UTC'}).format(date)};});
export function dayKey(value:string){if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;return new Intl.DateTimeFormat('sv-SE',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Europe/Madrid'}).format(new Date(value));}
export function eventKind(p:Post){return p.title.toLowerCase().startsWith('gira ')?'gira':p.category==='torneos'?'torneo':p.category==='quedadas'?'quedada':p.category==='charlas'?'charla':'empresa';}
export const kindLabels:Record<string,string>={gira:'Giras',torneo:'Torneos',quedada:'Quedadas',charla:'Charlas',empresa:'Empresa'};
export function seasonEvents(posts:Post[]){return posts.filter(p=>p.published&&isEvent(p.category)&&((p.date&&dayKey(p.date)<=SEASON_END&&dayKey(p.endDate||p.date)>=SEASON_START)||(!p.date&&p.month&&p.month<=SEASON_END.slice(0,7)&&(p.endMonth||p.month)>=SEASON_START.slice(0,7))));}
export function eventsOnDay(posts:Post[],day:string){return posts.filter(p=>p.date&&day>=dayKey(p.date)&&day<=dayKey(p.endDate||p.date));}
export function monthPlans(posts:Post[],month:string){return posts.filter(p=>!p.date&&p.month&&month>=p.month&&month<=(p.endMonth||p.month));}
