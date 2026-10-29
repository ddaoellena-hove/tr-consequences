import test from 'node:test';
import assert from 'node:assert/strict';
import {generalErrors, impactErrors, validDate} from '../src/validation.mjs';
const base = {from:2,to:3,start:'2026-11-02T06:00',end:'2026-11-06T23:00',message:'Travaux'};
test('les champs généraux partagent la même règle de complétude',()=>{
 assert.deepEqual(generalErrors({title:'Travaux',cause:'Travaux'}),{});
 assert.deepEqual(Object.keys(generalErrors({title:'  ',cause:'Inconnue'})),['title','cause']);
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
