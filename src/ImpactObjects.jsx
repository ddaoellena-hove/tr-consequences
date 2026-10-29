import React,{useState} from 'react';
import {PageSection, Dropdown, GhostButton, PrimaryButton, Modal, TextInput, EmptyState, FieldRow} from '@ddaoellena/cadence-ui';
import {OBJECT_TYPES,uid,objectTitle} from './disruption-workflow.mjs';
import {DisruptionObjectIcon} from './DisruptionObjectIcon.jsx';

export function ImpactObjects({impact,stations,line,errors,onChange}){
 const [adding,setAdding]=useState(false),[type,setType]=useState('section');
 const update=(id,patch)=>onChange({objects:impact.objects.map(o=>o.id===id?{...o,...patch}:o)});
 const stops=stations.map((label,index)=>({id:String(index),label}));
 return <div className="workflow-stack" id="field-objects">
  {!impact.objects.length&&<EmptyState size="inline" title="Aucun objet impacté" description="Ajoutez une ligne, un tronçon, un arrêt ou un autre objet concerné."/>}
  {impact.objects.map((o,index)=><div id={`field-object-${o.id}`} key={o.id}><PageSection surface="card" headingLevel={4} title={`${OBJECT_TYPES.find(t=>t.id===o.scope)?.label||'Objet'} · objet ${index+1}`} iconElement={<DisruptionObjectIcon scope={o.scope}/>} className="workflow-object" gap={0}
    actions={<GhostButton size="sm" icon="trash" tone="danger" aria-label="Supprimer" onClick={()=>onChange({objects:impact.objects.filter(v=>v.id!==o.id)})}/> }>
   <div className="workflow-card-content">
    <p className="workflow-muted">{objectTitle(o,stations)}</p>
    {['line','section'].includes(o.scope)&&<Dropdown label="Ligne" options={[{id:line.name||`Ligne ${line.code}`,label:line.name||`Ligne ${line.code}`}]} value={o.lineName} onChange={lineName=>update(o.id,{lineName})}/>}
    {o.scope==='line'&&<Dropdown label="Direction" options={['Toutes les directions',`Vers ${stations.at(-1)}`,`Vers ${stations[0]}`].map(label=>({id:label,label}))} value={o.direction} onChange={direction=>update(o.id,{direction})}/>}
    {o.scope==='section'&&<FieldRow className="workflow-row"><Dropdown label="Depuis l’arrêt" options={stops} value={String(o.from)} onChange={v=>update(o.id,{from:Number(v)})}/><Dropdown label="Jusqu’à l’arrêt" options={stops} value={String(o.to)} onChange={v=>update(o.id,{to:Number(v)})}/></FieldRow>}
    {['stop','access'].includes(o.scope)&&<Dropdown label="Arrêt concerné" options={stations.map(label=>({id:label,label}))} value={o.target?.split(' · ')[0]||''} onChange={target=>update(o.id,{target})}/>}
    {o.scope==='access'&&<TextInput label="Entrée ou sortie" placeholder="Ex. : Entrée 1 — Cour de Rome" value={o.accessName||''} onChange={e=>update(o.id,{accessName:e.target.value})}/>}
    {o.scope==='poi'&&<TextInput label="Point d’intérêt" placeholder="Nom et adresse du lieu" value={o.target} onChange={e=>update(o.id,{target:e.target.value})}/>}
    {o.scope==='network'&&<Dropdown label="Réseau" value={o.target} options={[{id:'Île-de-France Mobilités',label:'Île-de-France Mobilités'}]} onChange={target=>update(o.id,{target})}/>}
    {o.scope==='course'&&<TextInput label="Référence de la course" placeholder="Identifiant de la course concernée" value={o.target} onChange={e=>update(o.id,{target:e.target.value})}/>}
    {errors[`object-${o.id}`]&&<p className="field-error" role="alert">{errors[`object-${o.id}`]}</p>}
   </div>
  </PageSection></div>)}
  {errors.objects&&<p className="field-error" role="alert">{errors.objects}</p>}
  <div><GhostButton size="sm" iconStart="plus" label="Ajouter un type d’objet impacté" onClick={()=>setAdding(true)}/></div>
  <Modal isOpen={adding} onClose={()=>setAdding(false)} title="Ajouter un objet impacté" size="small"
   primaryAction={{label:'Ajouter',onClick:()=>{onChange({objects:[...impact.objects,{id:uid(),scope:type,lineName:line.name||`Ligne ${line.code}`,from:0,to:1,target:type==='network'?'Île-de-France Mobilités':'',direction:'Toutes les directions'}]});setAdding(false);}}}
   secondaryAction={{label:'Annuler',onClick:()=>setAdding(false)}}>
   <Dropdown label="Type d’objet" options={OBJECT_TYPES.map(t=>({...t,icon:<DisruptionObjectIcon scope={t.id}/>}))} value={type} onChange={setType}/>
  </Modal>
 </div>;
}
