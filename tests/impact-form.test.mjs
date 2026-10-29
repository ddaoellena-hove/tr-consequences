import test from 'node:test';
import assert from 'node:assert/strict';
import {removeFormImpact} from '../src/traffic-model.mjs';
const state=()=>({impacts:[{id:'a'},{id:'b'},{id:'c'}],current:1,impactSteps:{0:1,1:3,2:2},completed:{0:[0],1:[0,1,2],2:[0,1]}});
test('supprimer un impact réindexe son avancement sans le transmettre à un autre',()=>{
 const s=state();const result=removeFormImpact(s,1);
 assert.deepEqual(result,{impacts:[{id:'a'},{id:'c'}],current:1,impactSteps:{0:1,1:2},completed:{0:[0],1:[0,1]},step:2});
 assert.equal(s.impacts.length,3);
});
test('supprimer avant ou après la sélection conserve l’impact sélectionné et son étape',()=>{
 for(const removed of [0,2]){
  const result=removeFormImpact(state(),removed);
  assert.equal(result.impacts[result.current].id,'b');assert.equal(result.step,3);
 }
 const result=removeFormImpact({...state(),current:2},2);
 assert.equal(result.current,1);assert.equal(result.step,3);
});
test('le dernier impact et les positions invalides ne sont pas supprimables',()=>{
 assert.equal(removeFormImpact({...state(),impacts:[{id:'a'}],current:0},0),null);
 for(const removed of [-1,3,null])assert.equal(removeFormImpact(state(),removed),null);
});
