import React,{useState,lazy,Suspense} from 'react';
import {GhostButton,EmptyState} from '@ddaoellena/cadence-ui';
const ObjectImpactDrawer=lazy(()=>import('./ObjectImpactDrawer.jsx').then(module=>({default:module.ObjectImpactDrawer})));
import {ObjectSelectionCard} from './ObjectSelectionCard.jsx';
export function ImpactObjects({impact,stations,line,errors,onChange}){
 const [hasOpened,setHasOpened]=useState(false);
 const [open,setOpen]=useState(false),[version,setVersion]=useState(0),[editing,setEditing]=useState(null);
 const start=object=>{setHasOpened(true);setEditing(object||null);setVersion(v=>v+1);setOpen(true);};
 return <div className="workflow-stack" id="field-objects">
  {!impact.objects.length&&<EmptyState size="inline" title="Aucun objet impacté" description="Sélectionnez un ou plusieurs objets de votre réseau à associer à cet impact."/>}
  {impact.objects.map(object=><div id={`field-object-${object.id}`} key={object.id}><ObjectSelectionCard object={object} stations={stations} onEdit={()=>start(object)} onRemove={()=>onChange({objects:impact.objects.filter(v=>v.id!==object.id)})}/>{errors[`object-${object.id}`]&&<p className="field-error" role="alert">{errors[`object-${object.id}`]}</p>}</div>)}
  {errors.objects&&<p className="field-error" role="alert">{errors.objects}</p>}
  <div><GhostButton size="sm" iconStart="plus" label="Ajouter un ou plusieurs objets impactés" onClick={()=>start(null)}/></div>
  <Suspense fallback={<p role="status">Chargement du panneau…</p>}>{hasOpened&&<ObjectImpactDrawer key={version} isOpen={open} onClose={()=>setOpen(false)} impact={impact} stations={stations} line={line} editingObject={editing} onConfirm={objects=>{onChange({objects});setOpen(false);}}/>}</Suspense>
 </div>;
}
