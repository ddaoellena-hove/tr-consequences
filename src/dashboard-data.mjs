import {withGeneralInformation} from './general-information.mjs';
import { STATIONS, SEVERITY_MAP, newImpact } from './traffic-model.mjs';
export const RECORDS_KEY = 'traffic-report-records-v1';
export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `record-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const date = (day, hour = 6) => { const d = new Date(); d.setDate(d.getDate()+day); d.setHours(hour,0,0,0); return d.toISOString(); };
const period = (day, hour) => {const d=new Date(date(day,hour));const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;};
const L13 = {code:'13',mode:'metro',color:'#6bcbd4',name:'Ligne 13',operator:'RATP'};
const BUS31 = {code:'31',mode:'bus',color:'#f4d000',name:'Bus 31',operator:'RATP'};
const RERA = {code:'A',mode:'rer',color:'#e32735',name:'RER A',operator:'RATP'};
const M1 = {code:'1',mode:'metro',color:'#f3d311',name:'Ligne 1',operator:'RATP'};
const lines13 = ['Saint-Denis','La Fourche','Guy Môquet','Place de Clichy','Saint-Lazare','Châtillon – Montrouge'];
function impact(id,scope,title,severity,lines,detail,start=-2,end=3){return {...newImpact(),id,scope,title,severity,lines,detail,start:period(start,6),end:period(end,23),message:`${title}. Consultez les informations voyageurs avant votre déplacement.`};}
function record(id,title,cause,impacts,extra={}){return {id,title,cause,impacts,line:impacts[0]?.lines[0]??L13,stations:lines13,publication:'published',updatedAt:date(0,9),...extra};}
export function demoRecords(){return [
 record('demo-guy-moquet','Travaux de voirie — Guy Môquet','Travaux',[
 impact('imp-gm-line','line','Ligne 13 · Châtillon – Montrouge','reduit',[L13],'Direction Châtillon – Montrouge · fréquence réduite'),
 impact('imp-gm-stop','stop','Guy Môquet · desserte adaptée','modifie',[L13,BUS31],'Métro 13 : toutes les directions. Bus 31 : direction Charles de Gaulle – Étoile.'),
 ]),
 record('demo-hospital','Information d’accès — Hôpital Bretonneau','Événement',[
 impact('imp-hospital','poi','Hôpital Bretonneau (Paris)','informative',[],'62 rue Joseph de Maistre · accès piéton modifié'),
 ]),
 record('demo-nation','Interruption entre Nation et Gare de Lyon','Incident technique',[
 impact('imp-nation','section','Nation → Gare de Lyon','interrompu',[RERA,M1],'Tronçon non passant · itinéraires alternatifs disponibles'),
 ],{line:RERA,stations:['Vincennes','Fontenay','Nation','Gare de Lyon','Châtelet – Les Halles','Auber']}),
 record('demo-stlazare','Accès fermés — Saint-Lazare','Travaux',[
 impact('imp-access','access','Saint-Lazare · entrées et sorties','informative',[L13],'Accès 1 · Cour de Rome et 4 · Galerie des Marchands fermés'),
 ]),
 record('demo-weekend','Travaux programmés — Ligne 13','Travaux',[
 impact('imp-weekend','section','La Fourche → Place de Clichy','bloquante',[L13],'Interruption programmée, bus de remplacement',3,5),
 ],{updatedAt:date(-1,14)}),
 record('demo-event','Dispositif événementiel — Bus 31','Événement',[
 impact('imp-event','line','Bus 31 · offre renforcée','modifie',[BUS31],'Desserte adaptée à la sortie de l’événement',1,2),
 ],{line:BUS31}),
 record('demo-ended','Fin de travaux — Ligne 1','Travaux',[
 impact('imp-ended','section','Nation → Gare de Lyon','perturbe',[M1],'Circulation rétablie',-6,-3),
 ],{line:M1,updatedAt:date(-3,23)}),
 record('demo-old','Incident résolu — Bus 31','Incident technique',[
 impact('imp-old','line','Bus 31 · trafic rétabli','reduit',[BUS31],'Le service a repris normalement',-4,-1),
 ],{line:BUS31,updatedAt:date(-1,23)}),
 record('demo-draft','Préparation des travaux de novembre','Travaux',[
 impact('imp-draft','section','Université → Hôpital','bloquante',[{code:'12',mode:'bus',name:'Ligne 12',operator:'Réseau de démonstration'}],'Déclaration à compléter',7,9),
 ],{publication:'draft',stations:STATIONS,line:{code:'12',mode:'bus',name:'Ligne 12'}}),
];}
export function isRecord(value){return Boolean(value&&typeof value.id==='string'&&typeof value.title==='string'&&typeof value.cause==='string'&&Array.isArray(value.stations)&&value.stations.length===6&&value.stations.every(v=>typeof v==='string')&&Array.isArray(value.impacts)&&value.impacts.length&&value.impacts.every(i=>i&&typeof i.id==='string'&&SEVERITY_MAP[i.severity]&&typeof i.start==='string'&&typeof i.end==='string'&&typeof i.message==='string'&&Array.isArray(i.lines)&&i.lines.every(l=>l&&typeof l.code==='string')&&Number.isInteger(i.from)&&Number.isInteger(i.to)&&i.from>=0&&i.from<6&&i.to>=0&&i.to<6));}
export function loadRecords(){try{const text=localStorage.getItem(RECORDS_KEY);if(text!==null){const values=JSON.parse(text);if(Array.isArray(values)&&values.every(isRecord))return values;}}catch{}return demoRecords();}
export function storeRecords(records){localStorage.setItem(RECORDS_KEY,JSON.stringify(records));}
export function upsertRecord(data,publication='draft'){
 data=withGeneralInformation(data);
 const current=loadRecords();const now=new Date().toISOString();
 const item={...data,id:data.id||makeId(),publication,updatedAt:now,stations:data.stations||STATIONS,line:data.line||{code:'12',mode:'bus',name:'Ligne 12'},impacts:data.impacts.map(i=>({...i,id:i.id||makeId(),scope:i.scope||'section',title:i.title||`${(data.stations||STATIONS)[i.from]} → ${(data.stations||STATIONS)[i.to]}`,lines:i.lines||[data.line||{code:'12',mode:'bus',name:'Ligne 12'}],detail:i.detail||''}))};
 storeRecords(current.some(r=>r.id===item.id)?current.map(r=>r.id===item.id?item:r):[item,...current]);return item;
}
export function periodOf(record){const starts=record.impacts.map(i=>Date.parse(i.start)).filter(Number.isFinite);const ends=record.impacts.map(i=>Date.parse(i.end)).filter(Number.isFinite);return {start:starts.length?Math.min(...starts):null,end:ends.length?Math.max(...ends):null};}
export function statusOf(record,now=Date.now()){if(record.publication==='draft')return 'draft';const{start,end}=periodOf(record);return end!==null&&end<now?'past':start!==null&&start>now?'upcoming':'active';}
export const SCOPE_LABELS={line:'Ligne',stop:'Arrêt / déviation',section:'Tronçon',access:'Entrée / sortie',poi:'Point d’intérêt'};
export const severityRank={bloquante:0,interrompu:1,modifie:2,reduit:3,perturbe:4,informative:5};
export function dominantSeverity(impacts){return [...impacts].sort((a,b)=>severityRank[a.severity]-severityRank[b.severity])[0]?.severity||'informative';}
export function dashboardRows(records,{tab='active',view='disruption',query='',line='all',severity='all',cause='all',scope='all',sort='updatedAt',direction='desc'}={},now=Date.now()){
 const q=query.trim().toLocaleLowerCase('fr');
 const rows=[];
 for(const record of records){if(statusOf(record,now)!==tab||cause!=='all'&&record.cause!==cause)continue;
  if(view==='impact'){
   for(const impact of record.impacts){const searchable=[record.title,record.cause,impact.title,impact.detail,impact.message,...impact.lines.map(l=>l.name||l.code)].join(' ').toLocaleLowerCase('fr');
    if((q&&!searchable.includes(q))||(line!=='all'&&!impact.lines.some(l=>`${l.mode}:${l.code}`===line))||(severity!=='all'&&impact.severity!==severity)||(scope!=='all'&&impact.scope!==scope))continue;
    rows.push({key:`${record.id}/${impact.id}`,record,impacts:[impact],title:impact.title||record.title});
   }
  }else{
   const searchable=[record.title,record.cause,...record.impacts.flatMap(i=>[i.title,i.detail,i.message,...i.lines.map(l=>l.name||l.code)])].join(' ').toLocaleLowerCase('fr');
   // A disruption matches only when the same impact satisfies all impact filters.
   if(q&&!searchable.includes(q)||!record.impacts.some(i=>(line==='all'||i.lines.some(l=>`${l.mode}:${l.code}`===line))&&(severity==='all'||i.severity===severity)&&(scope==='all'||i.scope===scope)))continue;
   rows.push({key:record.id,record,impacts:record.impacts,title:record.title});
  }
 }
 const sortValue=row=>sort==='severity'?severityRank[dominantSeverity(row.impacts)]:sort==='title'?row.title:sort==='updatedAt'?Date.parse(row.record.updatedAt)||0:periodOf({impacts:row.impacts})[sort]??0;
 return rows.sort((a,b)=>{const av=sortValue(a),bv=sortValue(b);const compared=typeof av==='string'?av.localeCompare(bv,'fr'):av-bv;return(direction==='asc'?1:-1)*compared||a.key.localeCompare(b.key);});
}
export function removeRows(records,rows,view){
 if(view==='disruption'){const ids=new Set(rows.map(r=>r.record.id));return records.filter(r=>!ids.has(r.id));}
 const ids=new Set(rows.flatMap(r=>r.impacts.map(i=>`${r.record.id}/${i.id}`)));
 return records.map(r=>({...r,impacts:r.impacts.filter(i=>!ids.has(`${r.id}/${i.id}`))})).filter(r=>r.impacts.length);
}
