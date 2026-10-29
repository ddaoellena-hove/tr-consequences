// Small, explicit demonstration catalogue inspired by the Figma examples.
// These IDs and timetables are NOT a production transit referential.
import {uid} from './disruption-workflow.mjs';
const line=(id,code,mode,color,stops,name=`Ligne ${code}`)=>({id,code,mode,color,stops,name,operator:'RATP',directions:[`Vers ${stops.at(-1)}`,`Vers ${stops[0]}`]});
const DEMO_LINES=[
 line('m13','13','metro','#6bcbd4',['Saint-Denis - Université','La Fourche','Guy Môquet','Place de Clichy','Saint-Lazare','Châtillon - Montrouge']),
 line('m12','12','metro','#00814f',['Mairie d’Aubervilliers','Lamarck - Caulincourt','Saint-Lazare','Concorde','Montparnasse','Porte de Versailles']),
 line('m2','2','metro','#216eb4',['Porte Dauphine','Charles de Gaulle - Étoile','La Chapelle','Belleville','Père Lachaise','Nation']),
 line('m1','1','metro','#f3d311',['La Défense','Charles de Gaulle - Étoile','Châtelet','Gare de Lyon','Nation','Château de Vincennes']),
 line('rera','A','rer','#e32735',['La Défense','Charles de Gaulle - Étoile','Châtelet','Gare de Lyon','Nation','Marne-la-Vallée - Chessy'],'RER A'),
 line('m14','14','metro','#662483',['Saint-Denis - Pleyel','Mairie de Saint-Ouen','Porte de Clichy','Saint-Lazare','Gare de Lyon','Aéroport d’Orly']),
 line('b21','21','bus','#f4d000',['Porte de Saint-Ouen','Lamarck - Caulincourt','La Fourche','Saint-Lazare','Le Peletier','Stade Charléty'],'Bus 21'),
 line('b31','31','bus','#f4d000',['Charles de Gaulle - Étoile','Guy Môquet','La Fourche','Lamarck - Caulincourt','Mairie du 18e - Jules Joffrin','Gare de l’Est'],'Bus 31'),
 line('tram','T3b','tram','#00a88f',['Porte de la Chapelle','Porte d’Aubervilliers','Porte de Pantin','Porte des Lilas','Porte de Bagnolet','Porte de Vincennes'],'Tramway T3b'),
 line('train','L','train','#b6bd00',['Paris Saint-Lazare','Pont Cardinet','Clichy - Levallois','Asnières-sur-Seine','Bécon-les-Bruyères','La Défense'],'Transilien L'),
 line('funiculaire','F','funicular','#8b5e3c',['Montmartre — station basse','Montmartre — station haute'],'Funiculaire de Montmartre'),
];
export const MODE_OPTIONS=['bus','metro','tram','train','funicular'];
export const NETWORKS=[{id:'ratp',name:'RATP',modes:['bus','metro','tram','rer','funicular']},{id:'sncf',name:'SNCF Transilien',modes:['train','rer']},{id:'keolis',name:'Keolis Val-de-Marne',modes:['bus']}];
export const POIS=[{id:'bretonneau',name:'Hôpital Bretonneau',address:'62 rue Joseph de Maistre, Paris',type:'health'},{id:'clos',name:'Jardin du Clos Montmartre',address:'21 rue Saint-Vincent, Paris',type:'park'},{id:'stade',name:'Stade de France',address:'Saint-Denis',type:'sport'}];
export const ACCESSES=[['1','Cour de Rome'],['2','Place du Havre'],['3','Passage du Havre'],['4','Galerie des Marchands'],['5','Rue Intérieure'],['6','Place Gabriel Péri'],['9','Cour du Havre']].map(([id,name])=>({id,name}));
export function catalogueFor(currentLine,stations){
 const matching=DEMO_LINES.find(l=>l.code===currentLine.code&&l.mode===currentLine.mode&&l.stops.join('|')===stations.join('|'));
 const context=matching||{...currentLine,id:'context',name:currentLine.name||`Ligne ${currentLine.code}`,operator:currentLine.operator||'Réseau de démonstration',stops:stations,directions:[`Vers ${stations.at(-1)}`,`Vers ${stations[0]}`]};
 const lines=matching?DEMO_LINES:[context,...DEMO_LINES];
 const names=[...new Set(lines.flatMap(l=>l.stops))];
 return {lines,areas:names.map((name,index)=>({id:`area-${index}`,name,lines:lines.filter(l=>l.stops.includes(name))}))};
}
export const matchesModes=(modes,line)=>!modes.length||modes.includes(line.mode)||(line.mode==='rer'&&modes.includes('train'));
export function objectFingerprint(o){return JSON.stringify([o.scope,o.selectionId||o.target||'',o.fromName||o.from,o.toName||o.to,[...(o.lineIds||[])].sort(),Object.entries(o.directionSelections||{}).map(([id,ds])=>[id,[...ds].sort()]).sort(),[...(o.accessIds||[])].sort(),o.courseId||'']);}
export function mergeObjectSelection(existing,staged,editingId=null){
 const remaining=existing.filter(o=>o.id!==editingId),seen=new Set(remaining.map(objectFingerprint));
 for(const object of staged){const key=objectFingerprint(object);if(!seen.has(key)){remaining.push({...object,id:object.id||uid()});seen.add(key);}}
 return remaining;
}
export function stageObject(staged,object){return mergeObjectSelection(staged,[object]);}
export function directionsFor(lines,selections){return lines.flatMap(l=>(selections[l.id]||[]).map(d=>`${l.name} · ${d}`));}
export function buildObject({scope,selectedLines=[],directionSelections={},area,first,last,accessIds=[],poi,network,course,stopPoint,contextStations}){
 const primary=selectedLines[0],names=primary?.stops||contextStations;
 const from=names.indexOf(first?.name),to=names.indexOf(last?.name);
 return {id:uid(),scope,selectionId:stopPoint?.id||area?.id||poi?.id||network?.id||primary?.id||'',
  lineIds:selectedLines.map(l=>l.id),lines:selectedLines.map(({stops,directions,id,...l})=>l),lineName:selectedLines.map(l=>l.name).join(', '),
  directionSelections,direction:directionsFor(selectedLines,directionSelections).join(' ; '),
  target:stopPoint?.name||area?.name||(poi?`${poi.name} · ${poi.address}`:network?.name)||course?.name||'',
  from:from>=0&&to>=0?Math.min(from,to):0,to:from>=0&&to>=0?Math.max(from,to):1,
  fromName:first?.name||'',toName:last?.name||'',stationNames:names,
  accessIds,accessName:accessIds.map(id=>ACCESSES.find(a=>a.id===id)).filter(Boolean).map(a=>`${a.id} — ${a.name}`).join(', '),
  courseId:course?.id||'',course:course||null,
 };
}
export function demoCourses(line,direction,date){
 const names=direction===line.directions[1]?[...line.stops].reverse():line.stops;
 return Array.from({length:5},(_,n)=>{const times=names.map((station,index)=>{const d=new Date(`${date}T10:00`);d.setMinutes(d.getMinutes()+n*12+index*4);return {station,time:d.toISOString()};});return {id:`${line.id}-${direction}-${date}-${n+1}`,name:`Course ${n+1}`,date,direction,stops:times,start:times[0].time,end:times.at(-1).time};});
}
