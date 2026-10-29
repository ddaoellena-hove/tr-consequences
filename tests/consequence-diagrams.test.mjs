import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogueFor,buildObject} from '../src/object-catalogue.mjs';
import {consequenceDiagrams} from '../src/consequence-diagrams.mjs';
const stations=['A','B','C','D','E','F'],line={code:'12',mode:'bus',name:'Ligne 12'};
const catalogue=catalogueFor(line,stations);
test('Châtelet — Gare de Lyon produit un schéma distinct pour Métro 1 et RER A',()=>{
 const lines=catalogue.lines.filter(l=>['m1','rera'].includes(l.id));
 const first=catalogue.areas.find(a=>a.name==='Gare de Lyon'),last=catalogue.areas.find(a=>a.name==='Châtelet');
 const object=buildObject({scope:'section',selectedLines:lines,first,last,directionSelections:{},contextStations:stations});
 const result=consequenceDiagrams({objects:[object]},stations,line);
 assert.equal(result.views.length,2);assert.deepEqual(result.views.map(v=>v.line.code),['1','A']);assert.notDeepEqual(result.views[0].stations,result.views[1].stations);
 for(const view of result.views)assert.deepEqual([view.stations[view.from],view.stations[view.to]],['Châtelet','Gare de Lyon']);
 assert.deepEqual(result.unavailable,[]);
});
test('les indices sont propres à chaque ligne et tous les tronçons sont représentés',()=>{
 const objects=[{id:'shared',scope:'railSection',lineSections:[{line:{mode:'metro',code:'1'},stations:['A','B','C','D','E','F'],from:1,to:4},{line:{mode:'rer',code:'A'},stations:['B','G','H','E','I','J'],from:0,to:3}]},{id:'other',scope:'section',lineSections:[{line,stations,from:2,to:3}]}];
 const result=consequenceDiagrams({objects},stations,line);assert.equal(result.views.length,3);assert.deepEqual(result.views.map(v=>[v.from,v.to]),[[1,4],[0,3],[2,3]]);assert.equal(new Set(result.views.map(v=>v.key)).size,3);
});
test('les anciens objets restent compatibles et un référentiel incompatible n’est pas inventé',()=>{
 const legacy=consequenceDiagrams({lines:[{code:'1',mode:'metro'}],objects:[{id:'old',scope:'section',from:1,to:3}]},stations,line);
 assert.equal(legacy.views.length,1);assert.equal(legacy.views[0].line.code,'12');
 const result=consequenceDiagrams({objects:[{id:'short',scope:'section',lineSections:[{line,stations:['A','B'],from:0,to:1}]}]},stations,line);
 assert.equal(result.views.length,0);assert.deepEqual(result.unavailable,['Ligne 12']);
 assert.equal(consequenceDiagrams({objects:[{scope:'poi',target:'Lieu'}]},stations,line).views.length,0);
});
