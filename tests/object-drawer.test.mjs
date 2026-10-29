import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogueFor,matchesModes,buildObject,stageObject,mergeObjectSelection,demoCourses} from '../src/object-catalogue.mjs';
import {workflowErrors,projectImpact} from '../src/disruption-workflow.mjs';
const stations=['Gare Centre','République','Université','Hôpital','Stade','Zénith'];
const catalog=catalogueFor({code:'12',mode:'bus',name:'Ligne 12'},stations);
test('le catalogue conserve le contexte et les modes filtrent les options sans modifier la sélection',()=>{
 assert.deepEqual(catalog.lines.find(l=>l.id==='context').stops,stations);
 assert.ok(catalog.lines.some(l=>l.mode==='funicular'));assert.equal(matchesModes(['train'],{mode:'rer'}),true);assert.equal(matchesModes(['bus'],{mode:'metro'}),false);
});
test('la sélection temporaire déduplique et ne modifie pas les objets de l’impact avant confirmation',()=>{
 const old={id:'existing',scope:'network',selectionId:'ratp',target:'RATP'},added={id:'new',scope:'network',selectionId:'sncf',target:'SNCF'};
 const original=[old],basket=stageObject([],added);assert.deepEqual(original,[old]);assert.equal(stageObject(basket,{...added,id:'duplicate'}).length,1);
 assert.deepEqual(mergeObjectSelection(original,basket).map(o=>o.id),['existing','new']);assert.deepEqual(original,[old]);
 assert.deepEqual(mergeObjectSelection(original,[{...old,target:'Nouveau réseau'}],'existing').map(o=>o.target),['Nouveau réseau']);
});
test('les tronçons conservent les bornes nommées, les directions et les identités de ligne',()=>{
 const selected=catalog.lines.find(l=>l.id==='m13');const first=catalog.areas.find(a=>a.name==='Saint-Lazare'),last=catalog.areas.find(a=>a.name==='Guy Môquet');
 const object=buildObject({scope:'section',selectedLines:[selected],directionSelections:{m13:[selected.directions[0]]},first,last,contextStations:stations});
 assert.equal(object.fromName,'Saint-Lazare');assert.equal(object.toName,'Guy Môquet');assert.equal(object.from,2);assert.equal(object.to,4);assert.deepEqual(workflowErrors({objects:[object]},0),{});
 const impact=projectImpact({objects:[object],message:'',start:'',end:''},stations);assert.equal(impact.lines[0].code,'13');assert.ok(impact.title.includes('Saint-Lazare'));
});
test('arrêt, zone d’arrêt, déviation et tronçon ferroviaire restent des types distincts',()=>{
 for(const scope of ['stopPoint','stopArea','stop','network','poi'])assert.deepEqual(workflowErrors({objects:[{id:scope,scope,target:'Objet démo'}]},0),{});
 assert.deepEqual(workflowErrors({objects:[{id:'rail',scope:'railSection',lineName:'RER A',from:1,to:3}]},0),{});
});
test('les accès et les courses conservent leur sélection structurée',()=>{
 const line=catalog.lines.find(l=>l.id==='m13'),area=catalog.areas.find(a=>a.name==='Saint-Lazare');
 const access=buildObject({scope:'access',selectedLines:[line],directionSelections:{m13:[line.directions[0]]},area,accessIds:['1','4'],contextStations:stations});
 assert.match(access.accessName,/Cour de Rome/);assert.match(access.accessName,/Galerie des Marchands/);assert.deepEqual(workflowErrors({objects:[access]},0),{});
 const courses=demoCourses(line,line.directions[1],'2026-11-02');assert.equal(courses.length,5);assert.equal(courses[0].stops[0].station,line.stops.at(-1));assert.ok(Date.parse(courses[0].start)<Date.parse(courses[0].end));assert.notEqual(courses[0].id,courses[1].id);
 const course=buildObject({scope:'course',selectedLines:[line],directionSelections:{m13:[line.directions[1]]},course:courses[0],contextStations:stations});assert.equal(course.courseId,courses[0].id);assert.equal(course.course.stops.length,6);
});
