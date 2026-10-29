import test from 'node:test';
import assert from 'node:assert/strict';
import {demoRecords,isRecord,statusOf,dashboardRows,removeRows,periodOf} from '../src/dashboard-data.mjs';
const sample=(id,publication,impacts)=>({id,publication,title:id,cause:'Travaux',updatedAt:'2026-10-29T10:00:00Z',impacts});
const impact=(id,line,severity='informative')=>({id,title:id,detail:'Travaux',message:'Information',scope:'line',severity,lines:[{mode:'metro',code:line,name:`Ligne ${line}`}],start:'2026-10-28T06:00:00Z',end:'2026-10-30T23:00:00Z'});
const now=Date.parse('2026-10-29T12:00:00Z');
test('les données de démonstration respectent le modèle et couvrent les statuts',()=>{
 const records=demoRecords();assert.ok(records.every(isRecord));
 assert.deepEqual(new Set(records.map(r=>statusOf(r))),new Set(['active','upcoming','past','draft']));
});
test('un brouillon reste un brouillon quelle que soit sa période',()=>assert.equal(statusOf(sample('draft','draft',[impact('i','13')]),now),'draft'));
test('la période globale englobe tous les impacts',()=>{
 const a=impact('a','13'),b={...impact('b','1'),start:'2026-10-27T00:00:00Z',end:'2026-11-01T00:00:00Z'};
 assert.deepEqual(periodOf({impacts:[a,b]}),{start:Date.parse(b.start),end:Date.parse(b.end)});
});
test('les filtres ligne et sévérité doivent correspondre au même impact',()=>{
 const records=[sample('r','published',[impact('a','13','informative'),impact('b','1','interrompu')])];
 assert.equal(dashboardRows(records,{line:'metro:13',severity:'interrompu'},now).length,0);
 assert.equal(dashboardRows(records,{line:'metro:1',severity:'interrompu'},now).length,1);
});
test('la vue par impact sépare les lignes et préserve le parent',()=>{
 const records=[sample('r','published',[impact('a','13'),impact('b','1')])];
 const rows=dashboardRows(records,{view:'impact'},now);assert.equal(rows.length,2);
 assert.equal(removeRows(records,[rows[0]],'impact')[0].impacts.length,1);
 assert.equal(removeRows(records,rows,'impact').length,0);
 assert.equal(removeRows(records,[rows[0]],'disruption').length,0);
});
test('recherche et tri portent sur l’ensemble des résultats',()=>{
 const records=[sample('Zola','published',[impact('a','13')]),sample('Anatole','published',[impact('b','1')])];
 assert.deepEqual(dashboardRows(records,{sort:'title',direction:'asc'},now).map(r=>r.title),['Anatole','Zola']);
 assert.equal(dashboardRows(records,{query:'ligne 13'},now)[0].title,'Zola');
});
test('enregistrer un brouillon puis le modifier conserve une seule identité', async()=>{
 const {upsertRecord,loadRecords,RECORDS_KEY}=await import('../src/dashboard-data.mjs');
 const values=new Map([[RECORDS_KEY,'[]']]);
 globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 try{
  const saved=upsertRecord({title:'Brouillon test',cause:'Travaux',reference:'TR-TEST',publicationStart:'2026-11-01T10:30',labels:['Travaux'],properties:[{id:'prop1',name:'Chantier',value:'42'}],impacts:[{...impact('i','13'),from:2,to:3}]});
  assert.ok(saved.id);assert.ok(isRecord(saved));assert.equal(loadRecords().length,1);
  const updated=upsertRecord({...saved,title:'Titre modifié'},'published');
  assert.equal(updated.id,saved.id);assert.equal(loadRecords().length,1);assert.equal(loadRecords()[0].title,'Titre modifié');
  assert.equal(loadRecords()[0].reference,'TR-TEST');assert.equal(loadRecords()[0].publicationStart,'2026-11-01T10:30');assert.deepEqual(loadRecords()[0].labels,['Travaux']);assert.deepEqual(loadRecords()[0].properties,[{id:'prop1',name:'Chantier',value:'42'}]);
 } finally {delete globalThis.localStorage;}
});
