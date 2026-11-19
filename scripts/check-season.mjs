import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const folder=mkdtempSync(join(tmpdir(),'hundra-season-'));
try{
 for(const file of ['content','season']){const source=readFileSync(resolve(`lib/${file}.ts`),'utf8');const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/(["'])\.\/content\1/g,'"./content.mjs"');writeFileSync(join(folder,file+'.mjs'),output);}
 const {seasonMonths,seasonEvents,eventsOnDay,monthPlans,eventKind,dayKey}=await import(pathToFileURL(join(folder,'season.mjs')).href);
 assert.equal(seasonMonths.length,12);assert.equal(seasonMonths[0].key,'2026-09');assert.equal(seasonMonths[11].key,'2027-08');assert.equal(new Set(seasonMonths.map(m=>m.key)).size,12);
 const post=(id,extra)=>({id,category:'calendario',title:'Actividad ficticia',published:true,date:'',endDate:'',...extra});
 const tournament=post('tournament',{category:'torneos',date:'2027-06-24',endDate:'2027-06-27'});const training=post('training',{category:'quedadas',date:'2027-06-25'});const period=post('period',{month:'2027-05',endMonth:'2027-06'});const draft=post('draft',{published:false,date:'2027-06-25'});
 const rows=seasonEvents([tournament,training,period,draft,post('old',{date:'2026-08-30'}),post('next',{date:'2027-09-01'}),post('stale-month',{date:'2027-09-01',month:'2027-06'}),post('overlap',{date:'2026-08-30',endDate:'2026-09-02'})]);
 assert.equal(rows.length,4);for(const day of ['24','25','26','27'])assert(eventsOnDay(rows,`2027-06-${day}`).some(p=>p.id==='tournament'));
 assert(!eventsOnDay(rows,'2027-06-23').some(p=>p.id==='tournament'));assert(!eventsOnDay(rows,'2027-06-28').some(p=>p.id==='tournament'));
 assert.equal(eventsOnDay(rows,'2027-06-25').length,2);assert.equal(eventsOnDay(rows,'2027-05-01').length,0);assert.equal(monthPlans(rows,'2027-05').length,1);assert.equal(monthPlans(rows,'2027-06').length,1);assert.equal(monthPlans(rows,'2027-07').length,0);
 assert.equal(eventKind(post('gira',{title:'Gira Madrid'})),'gira');assert.equal(eventKind(tournament),'torneo');assert.equal(eventKind(period),'empresa');assert.equal(dayKey('2027-06-24'),'2027-06-24');assert.equal(dayKey('2027-03-28T23:30:00Z'),'2027-03-29');
 console.log('PASS: temporada completa, límites, eventos de varios días, coincidencias, periodos sin día inventado, borradores y zona horaria de Madrid.');
}finally{rmSync(folder,{recursive:true,force:true});}
