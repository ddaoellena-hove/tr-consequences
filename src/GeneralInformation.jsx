import React from 'react';
import {PageSection, TextInput, Dropdown, DatePicker, Checkbox, GhostButton, FieldRow} from '@ddaoellena/cadence-ui';
import {CAUSES, validDate} from './validation.mjs';
import {LABEL_OPTIONS} from './general-information.mjs';
import {makeId} from './dashboard-data.mjs';

export function GeneralInformation({data, errors, onChange, onPublicationPending}) {
 const publicationDate=validDate(data.publicationStart)?new Date(data.publicationStart):null;
 const updateProperty=(id,patch)=>onChange({properties:data.properties.map(p=>p.id===id?{...p,...patch}:p)});
 return <PageSection surface="none" title="Déclarer une nouvelle perturbation prévue" headingLevel={3} gap={20}
   description="Les informations générales sont communes à tous les impacts." className="general-details">
  <div className="general-fields">
   <div id="field-title"><TextInput label="Nom" placeholder="Nom de la perturbation" value={data.title}
    state={errors.title?'error':'enabled'} helperText={errors.title} onChange={e=>onChange({title:e.target.value})}/></div>
   <div id="field-reference"><TextInput label="Référence de la perturbation" value={data.reference}
    state={errors.reference?'error':'enabled'} helperText={errors.reference} onChange={e=>onChange({reference:e.target.value})}/></div>
   <div id="field-cause"><Dropdown label="Cause" options={CAUSES.map(label=>({id:label,label}))} value={data.cause} error={errors.cause} onChange={cause=>onChange({cause})}/></div>
   <div id="field-publicationStart"><DatePicker label="Date et heure de début de publication" withTime value={publicationDate} error={errors.publicationStart}
    onInputStateChange={state=>onPublicationPending(state!=='confirmed')} onChange={date=>onChange({publicationStart:date.toISOString()})}/></div>
  </div>
  <fieldset className="general-labels"><legend>Étiquettes</legend><div className="general-label-options">
   {LABEL_OPTIONS.map(label=><div className="general-label-option" key={label}>
    <Checkbox aria-label={label} state={data.labels.includes(label)?'checked':'unchecked'} onChange={checked=>onChange({labels:checked?[...data.labels,label]:data.labels.filter(v=>v!==label)})}/>
    <span aria-hidden="true">{label}</span>
   </div>)}
  </div></fieldset>
  <PageSection surface="none" title="Propriétés" headingLevel={4} gap={12}>
   <div id="field-properties" role="group" aria-label="Propriétés" aria-describedby={errors.properties?'error-properties':undefined} className="general-properties">
    {data.properties.map((property,index)=><div className="general-property" key={property.id}>
     <FieldRow gap={12} className="general-property-fields">
      <TextInput label={`Nom de la propriété ${index+1}`} placeholder="Ex. : Référence travaux" value={property.name} onChange={e=>updateProperty(property.id,{name:e.target.value})}/>
      <TextInput label={`Valeur de la propriété ${index+1}`} placeholder="Ex. : TRV-2026-042" value={property.value} onChange={e=>updateProperty(property.id,{value:e.target.value})}/>
     </FieldRow>
     <GhostButton size="sm" icon="trash" tone="danger" aria-label="Supprimer" onClick={()=>onChange({properties:data.properties.filter(p=>p.id!==property.id)})}/>
    </div>)}
    {errors.properties&&<p id="error-properties" className="field-error" role="alert">{errors.properties}</p>}
   </div>
   <div><GhostButton size="sm" label="Ajouter une propriété" iconStart="plus" onClick={()=>onChange({properties:[...data.properties,{id:makeId(),name:'',value:''}]})}/></div>
  </PageSection>
 </PageSection>;
}
