import test from 'node:test';
import assert from 'node:assert/strict';
import {canCreateDisruption} from '../src/validation.mjs';
import {normalizeImpact,emptyWorkflowImpact} from '../src/disruption-workflow.mjs';
const impact=()=>normalizeImpact({...emptyWorkflowImpact(),objects:[{id:'o',scope:'section',lineName:'Ligne 12',from:1,to:3}],severity:'modifie',periods:[{id:'p',start:'2026-11-02T06:00',end:'2026-11-03T23:00'}],messageTitle:'Travaux',genericMessage:'Service adapté',message:'Service adapté',channels:['engine']});
const data=()=>({title:'Travaux',cause:'Travaux',reference:'TR-test',publicationStart:'2026-10-30T06:00',properties:[],impacts:[impact()]});
test('la création exige les étapes validées, mais pas la visite du résumé',()=>{
 const d=data();assert.equal(canCreateDisruption(d,{}),false);assert.equal(canCreateDisruption(d,{0:[0,1,2]}),false);assert.equal(canCreateDisruption(d,{0:[0,1,2,3]}),true);
});
test('la création est bloquée pour tout impact incomplet ou non validé',()=>{
 const d=data();d.impacts.push(impact());assert.equal(canCreateDisruption(d,{0:[0,1,2,3]}),false);assert.equal(canCreateDisruption(d,{0:[0,1,2,3],1:[0,1,2,3]}),true);
 for(const step of [0,1,2,3])assert.equal(canCreateDisruption(d,{0:[0,1,2,3],1:[0,1,2,3].filter(n=>n!==step)}),false);
 d.impacts[1].message='';assert.equal(canCreateDisruption(d,{0:[0,1,2,3],1:[0,1,2,3]}),false);
});
test('les champs généraux et les saisies de dates en cours bloquent la création',()=>{
 const d=data(),completed={0:[0,1,2,3]};assert.equal(canCreateDisruption(d,completed,{publicationPending:true}),false);assert.equal(canCreateDisruption(d,completed,{datePending:{notification:true}}),false);assert.equal(canCreateDisruption(d,completed,{datePending:{notification:false}}),true);
 d.title='';assert.equal(canCreateDisruption(d,completed),false);assert.equal(canCreateDisruption({...data(),impacts:[]},completed),false);
});
