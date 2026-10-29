// Prototype catalogues; replace these IDs with a transport referential at API integration.
export const OBJECT_TYPES=[{id:'line',label:'Ligne'},{id:'section',label:'Tronçon'},{id:'stop',label:'Arrêt / déviation'},{id:'access',label:'Entrée / sortie'},{id:'poi',label:'Point d’intérêt'},{id:'network',label:'Réseau'},{id:'course',label:'Course'}];
export const CHANNELS=[{id:'email',label:'E-mail'},{id:'engine',label:'Moteur de recherche'},{id:'facebook',label:'Facebook'},{id:'x',label:'Twitter / X'}];
export const DAYS=[{id:1,label:'Lundi'},{id:2,label:'Mardi'},{id:3,label:'Mercredi'},{id:4,label:'Jeudi'},{id:5,label:'Vendredi'},{id:6,label:'Samedi'},{id:0,label:'Dimanche'}];
export const uid=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const emptyPeriod=()=>({id:uid(),start:'',end:''});
export const emptySlot=()=>({id:uid(),dateFrom:'',dateTo:'',days:[],startTime:'',endTime:''});
export const emptyWorkflowImpact=()=>({severity:'',from:2,to:3,start:'',end:'',message:'',objects:[],scheduleMode:'periods',periods:[emptyPeriod()],slots:[emptySlot()],messageTitle:'',channels:[],messageMode:'single',channelMessages:{},notificationAt:'',translations:[]});
export function normalizeImpact(impact,title='') {
 return {...impact,
  objects:Array.isArray(impact.objects)?impact.objects:[{id:uid(),scope:impact.scope||'section',lineName:impact.lines?.[0]?.name||'Ligne 12',from:impact.from,to:impact.to,target:impact.title||'',direction:'Toutes les directions'}],
  scheduleMode:impact.scheduleMode||'periods',periods:Array.isArray(impact.periods)?impact.periods:[{id:uid(),start:impact.start||'',end:impact.end||''}],slots:Array.isArray(impact.slots)?impact.slots:[emptySlot()],
  genericMessage:impact.genericMessage??impact.message??'',messageTitle:impact.messageTitle??title,channels:impact.channels??['engine'],messageMode:impact.messageMode||'single',channelMessages:impact.channelMessages||{},notificationAt:impact.notificationAt||'',translations:impact.translations||[],
 };
}
export const normalizeWorkflow=data=>({...data,impacts:data.impacts.map(i=>normalizeImpact(i,data.title))});
export const localDay=value=>{const d=new Date(value);if(!Number.isFinite(d.getTime()))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;};
const dayDate=s=>new Date(`${s}T00:00:00`);
const validDay=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&localDay(`${s}T00:00` )===s;
const validTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function slotValid(slot){return validDay(slot.dateFrom)&&validDay(slot.dateTo)&&slot.dateFrom<=slot.dateTo&&slot.days?.length>0&&slot.days.every(d=>DAYS.some(day=>day.id===d))&&validTime(slot.startTime)&&validTime(slot.endTime)&&slot.startTime!==slot.endTime&&Boolean(slotDates(slot).length);}
function slotDates(slot){
 if(!validDay(slot.dateFrom)||!validDay(slot.dateTo)||slot.dateFrom>slot.dateTo||!slot.days?.length)return [];
 const first=dayDate(slot.dateFrom),last=dayDate(slot.dateTo);
 for(let n=0;n<7&&!slot.days.includes(first.getDay());n++)first.setDate(first.getDate()+1);
 for(let n=0;n<7&&!slot.days.includes(last.getDay());n++)last.setDate(last.getDate()-1);
 return first<=last?[first,last]:[];
}
function slotInterval(slot,date){const day=localDay(date);const start=new Date(`${day}T${slot.startTime}`),end=new Date(`${day}T${slot.endTime}`);if(slot.endTime<slot.startTime)end.setDate(end.getDate()+1);return {start:start.getTime(),end:end.getTime()};}
// Boundary windows plus nearby occurrences: no enumeration of an unbounded recurring series.
export function impactIntervals(impact,now=Date.now()){
 if(impact.scheduleMode!=='slots')return (impact.periods??[{start:impact.start,end:impact.end}]).map(p=>({start:Date.parse(p.start),end:Date.parse(p.end)})).filter(p=>Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.start<p.end);
 return (impact.slots||[]).filter(slotValid).flatMap(slot=>{
  const dates=slotDates(slot);const today=new Date(now);today.setHours(0,0,0,0);
  for(let n=-1;n<=7;n++){const d=new Date(today);d.setDate(d.getDate()+n);if(localDay(d)>=slot.dateFrom&&localDay(d)<=slot.dateTo&&slot.days.includes(d.getDay()))dates.push(d);}
  return dates.map(d=>slotInterval(slot,d));
 });
}
export function objectTitle(object,stations){
 if(object.scope==='section')return `${object.lineName} · ${stations[object.from]||'Début à choisir'} → ${stations[object.to]||'Fin à choisir'}`;
 if(object.scope==='access')return `${object.target||'Arrêt à renseigner'}${object.accessName?` · ${object.accessName}`:''}`;
 if(object.scope==='line')return `${object.lineName} · ${object.direction||'Toutes les directions'}`;
 return object.target||'Objet à renseigner';
}
export function projectImpact(impact,stations){
 const intervals=impactIntervals(impact),first=impact.objects?.[0];
 return {...impact,...(first?{scope:first.scope,title:objectTitle(first,stations),from:first.from??impact.from,to:first.to??impact.to}:{}),
  start:intervals.length?new Date(Math.min(...intervals.map(p=>p.start))).toISOString():'',end:intervals.length?new Date(Math.max(...intervals.map(p=>p.end))).toISOString():'',
  message:impact.messageMode==='custom'?(impact.channelMessages?.[impact.channels?.[0]]?.body||''):impact.genericMessage??impact.message,
 };
}
export function workflowErrors(impact,step){
 const errors={};
 if(step===0){
  if(!impact.objects?.length)errors.objects='Ajoutez au moins un objet impacté.';
  for(const [index,o] of (impact.objects||[]).entries()){
   if(!OBJECT_TYPES.some(t=>t.id===o.scope)||(['line','section'].includes(o.scope)&&!o.lineName?.trim())||o.scope==='section'&&(!Number.isInteger(o.from)||!Number.isInteger(o.to)||o.from<0||o.to>5||o.from>=o.to)||!['line','section'].includes(o.scope)&&!o.target?.trim()||o.scope==='access'&&!o.accessName?.trim())errors[`object-${o.id}`]=`Complétez l’objet ${index+1} et vérifiez son périmètre.`;
  }
 }
 if(step===1&&!['bloquante','interrompu','modifie','reduit','perturbe','informative'].includes(impact.severity))errors.severity='Sélectionnez une sévérité.';
 if(step===2){
  if(impact.scheduleMode==='slots'){
   if(!impact.slots?.length)errors.schedule='Ajoutez au moins un créneau.';
   for(const [n,s] of (impact.slots||[]).entries())if(!slotValid(s))errors[`slot-${s.id}`]=`Complétez le créneau ${n+1} : dates, jours applicables et heures distinctes.`;
  }else{
   if(!impact.periods?.length)errors.schedule='Ajoutez au moins une période.';
   for(const [n,p] of (impact.periods||[]).entries())if(!Number.isFinite(Date.parse(p.start))||!Number.isFinite(Date.parse(p.end))||Date.parse(p.start)>=Date.parse(p.end))errors[`period-${p.id}`]=`La période ${n+1} doit avoir un début valide antérieur à sa fin.`;
  }
 }
 if(step===3){
  if(!impact.messageTitle?.trim()||impact.messageTitle.length>160)errors.messageTitle='Renseignez un titre de 1 à 160 caractères.';
  if(!impact.channels?.length||impact.channels.some(c=>!CHANNELS.some(ch=>ch.id===c)))errors.channels='Sélectionnez au moins un canal de communication.';
  if(impact.messageMode==='custom'){
   for(const c of impact.channels||[]){const m=impact.channelMessages?.[c];if(!m?.title?.trim()||m.title.length>160||!m?.body?.trim())errors[`channel-${c}`]=`Complétez le titre (160 caractères maximum) et le message pour ${CHANNELS.find(ch=>ch.id===c)?.label||c}.`;if(m?.translations?.some(t=>!t.title?.trim()||t.title.length>160||!t.body?.trim()))errors[`channel-${c}`]='Complétez les traductions de ce canal ou supprimez-les.';}
  }else if(!impact.message?.trim())errors.message='Rédigez le message à diffuser.';
  if(impact.notificationAt&&!Number.isFinite(Date.parse(impact.notificationAt)))errors.notification='Renseignez une date de notification valide.';
  for(const t of impact.translations||[])if(!t.title?.trim()||t.title.length>160||!t.body?.trim())errors.translations='Complétez les traductions ajoutées ou supprimez-les.';
 }
 return errors;
}
