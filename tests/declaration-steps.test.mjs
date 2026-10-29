import test from 'node:test';
import assert from 'node:assert/strict';
import {declarationSteps} from '../src/declaration-steps.mjs';
const data={title:'Travaux',cause:'Travaux',reference:'TR-test',publicationStart:'2026-10-30T06:00',impacts:[{},{}]};
const build=patch=>declarationSteps({data,impactIndex:0,step:0,completed:{},generalActive:false,publicationPending:false,...patch});
test('les informations communes précèdent les cinq étapes d’impact',()=>{
 const result=build();assert.equal(result.steps.length,6);assert.equal(result.current,1);assert.equal(result.steps[0].label,'Informations générales');assert.equal(result.steps[0].state,'completed');assert.equal(result.steps[0].scope,'common');assert.equal(result.steps[1].state,'current');
});
test('l’étape générale peut être active ou invalide sans modifier la position de l’impact',()=>{
 const result=build({generalActive:true,step:3});assert.equal(result.current,0);assert.equal(result.steps[0].state,'current');assert.equal(result.steps[4].available,true);
 assert.equal(build({data:{...data,title:''}}).steps[0].state,'warning');assert.equal(build({data:{...data,title:''},generalActive:true,fieldErrors:{title:'Obligatoire'}}).steps[0].state,'error');assert.equal(build({publicationPending:true}).steps[0].state,'warning');
});
test('la progression à six étapes suit l’impact sélectionné et le résumé reste dernier',()=>{
 assert.equal(build({impactIndex:1,step:3}).current,4);assert.equal(build({step:4}).current,5);assert.equal(build({impactIndex:1}).steps[0].state,'completed');assert.equal(build().steps[5].available,false);
});
