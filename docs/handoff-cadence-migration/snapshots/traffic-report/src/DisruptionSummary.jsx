import React from 'react';
import {PageSection,DescriptionList,Indicator,GhostButton,InlineAlert} from '@ddaoellena/cadence-ui';
import {OBJECT_TYPES,CHANNELS,DAYS,objectTitle,workflowErrors} from './disruption-workflow.mjs';
import {SEVERITY_MAP} from './traffic-model.mjs';
const format=value=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}):'À renseigner';
export function DisruptionSummary({data,stations,onEdit}){
 return <div className="workflow-stack">
  <PageSection title="Informations générales" headingLevel={4} gap={12}><DescriptionList items={[
   {id:'name',label:'Nom',value:data.title||'À renseigner'},{id:'reference',label:'Référence',value:data.reference},{id:'cause',label:'Cause',value:data.cause},{id:'publish',label:'Début de publication',value:format(data.publicationStart)},{id:'labels',label:'Étiquettes',value:data.labels.join(', ')||'Aucune'},{id:'properties',label:'Propriétés',value:data.properties.map(p=>`${p.name} : ${p.value}`).join(' · ')||'Aucune'},
  ]}/></PageSection>
  {data.impacts.map((impact,index)=>{const severity=SEVERITY_MAP[impact.severity];const incomplete=[0,1,2,3].some(step=>Object.keys(workflowErrors(impact,step)).length);return <PageSection key={impact.id||index} title={`Impact n° ${index+1}`} headingLevel={4} surface="card" gap={0} actions={<Indicator variant={incomplete?'draft':'nominal'} label={incomplete?'À compléter':'Renseigné'}/> }>
   <div className="workflow-card-content">
    <DescriptionList items={[
     {id:'objects',label:'Objets impactés',value:<div>{impact.objects.map(o=><p key={o.id}>{OBJECT_TYPES.find(t=>t.id===o.scope)?.label} : {objectTitle(o,stations)}{o.accessName?` · ${o.accessName}`:''}</p>)}</div>},
     {id:'severity',label:'Sévérité',value:severity?<Indicator variant={severity.variant} label={severity.label}/>:'À renseigner'},
     {id:'periods',label:impact.scheduleMode==='slots'?'Créneaux récurrents':'Périodes',value:<div>{impact.scheduleMode==='slots'?impact.slots.map(s=><p key={s.id}>{s.dateFrom||'—'} → {s.dateTo||'—'} · {DAYS.filter(d=>s.days.includes(d.id)).map(d=>d.label).join(', ')} · {s.startTime||'—'} → {s.endTime||'—'}{s.endTime<s.startTime?' (lendemain)':''}</p>):impact.periods.map(p=><p key={p.id}>{format(p.start)} → {format(p.end)}</p>)}</div>},
     {id:'notification',label:'Notification',value:impact.notificationAt?format(impact.notificationAt):'Non programmée'},
     {id:'messages',label:'Messages par canal',value:<div className="workflow-preview">{impact.channels.map(c=>{const m=impact.messageMode==='custom'?impact.channelMessages[c]:{title:impact.messageTitle,body:impact.genericMessage};return <div key={c}><strong>{CHANNELS.find(ch=>ch.id===c)?.label}</strong><p>{m?.title||'Titre à renseigner'}</p><p>{m?.body||'Message à renseigner'}</p>{m?.translations?.map(t=><p key={t.locale}><strong>{t.locale.toUpperCase()} · {t.title}</strong><br/>{t.body}</p>)}</div>;})}</div>},
     {id:'translations',label:'Traductions',value:impact.translations.length?<div>{impact.translations.map(t=><div key={t.locale}><strong>{t.locale.toUpperCase()} · {t.title}</strong><p>{t.body}</p></div>)}</div>:'Aucune'},
    ]}/>
    <div className="workflow-actions">{['Objets','Sévérité','Périodes / créneaux','Messages'].map((label,step)=><GhostButton size="sm" key={label} label={`Modifier · ${label}`} onClick={()=>onEdit(index,step)}/>)}</div>
   </div>
  </PageSection>;})}
  <InlineAlert type="information" title="Validation de démonstration">La validation enregistre la perturbation dans le tableau de bord local. Elle n’envoie aucun message aux canaux sélectionnés.</InlineAlert>
 </div>;
}
