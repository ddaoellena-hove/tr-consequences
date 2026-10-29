import {catalogueFor} from './object-catalogue.mjs';

// Each line has its own stop order; never reuse another line's indices.
export function consequenceDiagrams(impact,stations,line){
 const catalogue=catalogueFor(line,stations);
 const views=[],unavailable=[];
 for(const object of impact.objects||[]){
  if(!['section','railSection'].includes(object.scope))continue;
  const startName=object.fromName||object.stationNames?.[object.from]||stations[object.from];
  const endName=object.toName||object.stationNames?.[object.to]||stations[object.to];
  const configured=object.lineSections?.length?object.lineSections:null;
  const sourceLines=object.lines?.length?object.lines:[catalogue.lines.find(candidate=>candidate.name===object.lineName)||line];
  const sections=configured||sourceLines.map((source,index)=>{
   const known=catalogue.lines.find(l=>l.id===object.lineIds?.[index])||catalogue.lines.find(l=>l.code===source.code&&l.mode===source.mode);
   const names=known?.stops.includes(startName)&&known.stops.includes(endName)?known.stops:index===0?(object.stationNames||stations):[];
   const from=names.indexOf(startName),to=names.indexOf(endName);
   return {line:source,stations:names,from:Math.min(from,to),to:Math.max(from,to)};
  });
  const seen=new Set();
  for(const section of sections){
   const identity=`${section.line.mode}:${section.line.code}`;
   if(seen.has(identity))continue;
   seen.add(identity);
   if(section.stations?.length!==6||!Number.isInteger(section.from)||!Number.isInteger(section.to)||section.from<0||section.to>5||section.from>=section.to){unavailable.push(section.line.name||`Ligne ${section.line.code}`);continue;}
   views.push({key:`${object.id}:${identity}`,line:section.line,stations:section.stations,from:section.from,to:section.to});
  }
 }
 return {views,unavailable:[...new Set(unavailable)]};
}
