import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeImpact,emptyWorkflowImpact,workflowErrors,impactIntervals,projectImpact,slotValid} from '../src/disruption-workflow.mjs';
import {statusOf,periodOf,upsertRecord,loadRecords,RECORDS_KEY,isRecord} from '../src/dashboard-data.mjs';
const section={id:'o',scope:'section',lineName:'Ligne 12',from:1,to:3};
const complete=()=>normalizeImpact({...emptyWorkflowImpact(),objects:[section],severity:'modifie',periods:[{id:'p',start:'2026-11-02T06:00',end:'2026-11-03T23:00'}],messageTitle:'Travaux',genericMessage:'Service adapté',message:'Service adapté',channels:['engine']});
test('un nouvel impact vide bloque chaque étape sans imposer une valeur fictive',()=>{
 const i=emptyWorkflowImpact();for(const step of [0,1,2,3])assert.ok(Object.keys(workflowErrors(i,step)).length);
 for(const step of [0,1,2,3])assert.deepEqual(workflowErrors(complete(),step),{});
});
test('les objets multiples sont tous validés, les accès exigent un nom',()=>{
 const i=complete();i.objects.push({id:'access',scope:'access',target:'Gare Centre',accessName:''});
 assert.ok(workflowErrors(i,0)['object-access']);i.objects[1].accessName='Porte nord';assert.deepEqual(workflowErrors(i,0),{});
 i.objects[0].to=0;assert.ok(workflowErrors(i,0)['object-o']);
});
test('les périodes disjointes ont une enveloppe et un statut respectant leur intervalle inactif',()=>{
 const i=complete();i.periods=[{id:'p1',start:'2026-11-02T06:00',end:'2026-11-02T08:00'},{id:'p2',start:'2026-11-04T06:00',end:'2026-11-04T08:00'}];
 const r={publication:'published',impacts:[i]};
 assert.equal(periodOf(r).end,Date.parse(i.periods[1].end));
 assert.equal(statusOf(r,Date.parse('2026-11-02T07:00')),'active');assert.equal(statusOf(r,Date.parse('2026-11-03T07:00')),'upcoming');assert.equal(statusOf(r,Date.parse('2026-11-05T07:00')),'past');
 i.periods[1].end=i.periods[1].start;assert.ok(workflowErrors(i,2)['period-p2']);
});
const night=()=>({id:'s',dateFrom:'2026-11-02',dateTo:'2026-11-06',days:[1,3,5],startTime:'22:00',endTime:'02:00'});
test('les créneaux récurrents et les heures après minuit suivent les jours de départ',()=>{
 const s=night();assert.equal(slotValid(s),true);const i={...complete(),scheduleMode:'slots',slots:[s]};
 const intervals=impactIntervals(i,Date.parse('2026-11-03T01:00'));assert.ok(intervals.some(p=>p.start===Date.parse('2026-11-02T22:00')&&p.end===Date.parse('2026-11-03T02:00')));
 assert.equal(statusOf({publication:'published',impacts:[i]},Date.parse('2026-11-03T01:00')),'active');
 assert.equal(statusOf({publication:'published',impacts:[i]},Date.parse('2026-11-03T12:00')),'upcoming');
 assert.equal(slotValid({...s,dateFrom:'2026-11-03',dateTo:'2026-11-03'}),false);
 assert.equal(slotValid({...s,dateFrom:'2026-02-30'}),false);assert.equal(slotValid({...s,days:[]}),false);
});
test('les messages personnalisés exigent un contenu pour chaque canal et préservent le générique',()=>{
 const i={...complete(),messageMode:'custom',channels:['email','x'],channelMessages:{email:{title:'Mail',body:'Message mail'}}};
 assert.ok(workflowErrors(i,3)['channel-x']);i.channelMessages.x={title:'X',body:'Message X'};assert.deepEqual(workflowErrors(i,3),{});
 const projected=projectImpact(i,['A','B','C','D']);assert.equal(projected.message,'Message mail');assert.equal(projected.genericMessage,'Service adapté');
 assert.equal(projectImpact({...projected,messageMode:'single'},['A','B','C','D']).message,'Service adapté');
 i.translations=[{locale:'en',title:'',body:''}];assert.ok(workflowErrors(i,3).translations);
});
test('migration des anciens impacts et sauvegarde des brouillons vides sans perdre le catalogue',()=>{
 const legacy=normalizeImpact({from:1,to:3,severity:'informative',start:'2026-11-02T06:00',end:'2026-11-03T23:00',message:'Travaux'},'Titre');
 assert.equal(legacy.objects[0].scope,'section');assert.equal(legacy.periods[0].start,'2026-11-02T06:00');assert.equal(legacy.genericMessage,'Travaux');
 const memory=new Map([[RECORDS_KEY,'[]']]);globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 try{
  const saved=upsertRecord({title:'Brouillon incomplet',cause:'',impacts:[emptyWorkflowImpact()]});assert.equal(isRecord(saved),true);assert.equal(loadRecords().length,1);assert.deepEqual(loadRecords()[0].impacts[0].objects,[]);assert.equal(loadRecords()[0].impacts[0].severity,'');
 }finally{delete globalThis.localStorage;}
});

test('l’enregistrement conserve objets, créneaux, messages par canal et traductions',()=>{
 const memory=new Map([[RECORDS_KEY,'[]']]);globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 try{
  const impact={...complete(),scheduleMode:'slots',slots:[night()],messageMode:'custom',channels:['email'],channelMessages:{email:{title:'Objet e-mail',body:'Message adapté'}},translations:[{locale:'en',title:'Works',body:'Disrupted service'}]};
  const saved=upsertRecord({title:'Travaux',cause:'Travaux',impacts:[impact]});
  const restored=loadRecords()[0].impacts[0];assert.deepEqual(restored.objects,impact.objects);assert.deepEqual(restored.slots,impact.slots);assert.deepEqual(restored.channelMessages,impact.channelMessages);assert.deepEqual(restored.translations,impact.translations);assert.equal(restored.message,'Message adapté');
  assert.equal(saved.impacts[0].start,new Date(impactIntervals(impact)[0].start).toISOString());
 }finally{delete globalThis.localStorage;}
});
