import test from 'node:test';
import assert from 'node:assert/strict';
import {generalErrors, impactErrors, validDate} from '../src/validation.mjs';
const base = {from:2,to:3,start:'2026-11-02T06:00',end:'2026-11-06T23:00',message:'Travaux'};
test('les champs généraux partagent la même règle de complétude',()=>{
 assert.deepEqual(generalErrors({title:'Travaux',cause:'Travaux',reference:'TR-42',publicationStart:'2026-11-02T06:00'}),{});
 assert.deepEqual(Object.keys(generalErrors({title:'  ',cause:'Inconnue'})),['title','cause','reference','publicationStart']);
});
test('les bornes du tronçon sont ordonnées et dans la ligne',()=>{
 assert.deepEqual(impactErrors(base,0),{});
 for(const patch of [{from:3},{from:-1},{to:6},{to:2.5}])assert.ok(impactErrors({...base,...patch},0).to);
});
test('la période signale les champs manquants et un ordre invalide',()=>{
 assert.deepEqual(impactErrors(base,2),{});
 assert.deepEqual(Object.keys(impactErrors({...base,start:'',end:'invalide'},2)),['start','end']);
 assert.ok(impactErrors({...base,end:base.start},2).end);
 assert.ok(impactErrors({...base,end:'2026-11-01T06:00'},2).end);
 assert.equal(validDate(''),false); assert.equal(validDate('invalide'),false);
});
test('un message composé uniquement d’espaces ne peut être validé',()=>{
 assert.ok(impactErrors({...base,message:' \n '},3).message);
 assert.deepEqual(impactErrors(base,3),{});
});

test('les métadonnées générales valident date, référence et propriétés sans imposer d’étiquette',()=>{
 const general={title:'Travaux',cause:'Travaux',reference:'TR-42',publicationStart:'2026-11-02T06:00',labels:[],properties:[]};
 assert.deepEqual(generalErrors(general),{});
 assert.ok(generalErrors({...general,publicationStart:'invalide'}).publicationStart);
 assert.ok(generalErrors({...general,reference:'  '}).reference);
 assert.ok(generalErrors({...general,properties:[{name:'Chantier',value:''}]}).properties);
 assert.ok(generalErrors({...general,properties:[{name:'Chantier',value:'1'},{name:' chantier ',value:'2'}]}).properties);
 assert.deepEqual(generalErrors({...general,properties:[{name:'Chantier',value:'1'}]}),{});
});

test('les anciens brouillons reçoivent des métadonnées stables et les champs existants sont préservés',async()=>{
 const {withGeneralInformation}=await import('../src/general-information.mjs');
 const old=withGeneralInformation({id:'ancien',title:'Travaux',updatedAt:'2026-10-29T09:00:00Z'});
 assert.equal(old.reference,'TR-ancien');assert.equal(old.publicationStart,'2026-10-29T09:00:00Z');
 assert.deepEqual(old.labels,[]);assert.deepEqual(old.properties,[]);
 assert.deepEqual(withGeneralInformation(old),old);
 const invalid=withGeneralInformation({reference:'',publicationStart:'invalide',labels:['Travaux','Travaux','Inconnue'],properties:null});
 assert.equal(invalid.reference,'');assert.equal(invalid.publicationStart,'invalide');assert.deepEqual(invalid.labels,['Travaux']);assert.deepEqual(invalid.properties,[]);
});
