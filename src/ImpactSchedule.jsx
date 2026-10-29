import React,{useMemo} from 'react';
import {PageSection,DatePicker,TimePicker,FieldRow,SegmentedControl,GhostButton,Checkbox,InlineAlert} from '@ddaoellena/cadence-ui';
import {emptyPeriod,emptySlot,DAYS,localDay} from './disruption-workflow.mjs';
export function WorkflowDate({value,label,withTime=true,onChange,onPending}){
 const date=useMemo(()=>value&&Number.isFinite(Date.parse(value))?new Date(value):null,[value]);
 return <div className="workflow-date" onChangeCapture={()=>onPending?.(true)}><DatePicker label={label} withTime={withTime} value={date} onChange={d=>{onPending?.(false);onChange(withTime?d.toISOString():localDay(d));}}/></div>;
}
export function ImpactSchedule({impact,errors,onChange,onPending}){
 const slots=impact.scheduleMode==='slots';
 const update=(key,id,patch)=>onChange({[key]:impact[key].map(p=>p.id===id?{...p,...patch}:p)});
 const remove=(key,id)=>{onPending(`${key==='slots'?'slot':'period'}-${id}`,false);onChange({[key]:impact[key].filter(p=>p.id!==id)});};
 return <div className="workflow-stack" id="field-schedule">
  <div><SegmentedControl aria-label="Mode de planification" value={impact.scheduleMode} options={[{value:'periods',label:'Période(s)'},{value:'slots',label:'Créneau(x) récurrent(s)'}]} onChange={scheduleMode=>{for(const p of impact[slots?'slots':'periods'])onPending(`${slots?'slot':'period'}-${p.id}`,false);onChange({scheduleMode});}}/></div>
  {slots&&<InlineAlert type="information" title="Créneaux récurrents">Choisissez les dates, les jours de la semaine et les heures. Une heure de fin antérieure au début se termine le lendemain.</InlineAlert>}
  {(slots?impact.slots:impact.periods).map((p,index)=>{const key=`${slots?'slot':'period'}-${p.id}`;return <div id={`field-${key}`} key={p.id}><PageSection title={`${slots?'Créneau':'Période'} ${index+1}`} headingLevel={4} surface="card" gap={0} className="workflow-schedule"
   actions={<GhostButton size="sm" icon="trash" tone="danger" aria-label="Supprimer" disabled={(slots?impact.slots:impact.periods).length===1} onClick={()=>remove(slots?'slots':'periods',p.id)}/> }>
   <div className="workflow-card-content">
    <FieldRow className="workflow-row">
     <WorkflowDate label={slots?'Date de début d’application':'Début d’application'} withTime={!slots} value={slots?(p.dateFrom?`${p.dateFrom}T00:00`:''):p.start} onPending={v=>onPending(key,v)} onChange={v=>update(slots?'slots':'periods',p.id,{[slots?'dateFrom':'start']:v})}/>
     <WorkflowDate label={slots?'Date de fin d’application':'Fin d’application'} withTime={!slots} value={slots?(p.dateTo?`${p.dateTo}T00:00`:''):p.end} onPending={v=>onPending(key,v)} onChange={v=>update(slots?'slots':'periods',p.id,{[slots?'dateTo':'end']:v})}/>
    </FieldRow>
    {slots&&<><fieldset className="workflow-fieldset"><legend>Jours d’application</legend><div className="workflow-choices">{DAYS.map(day=><div className="workflow-choice" key={day.id}><Checkbox aria-label={`${day.label} · créneau ${index+1}`} state={p.days.includes(day.id)?'checked':'unchecked'} onChange={checked=>update('slots',p.id,{days:checked?[...p.days,day.id]:p.days.filter(d=>d!==day.id)})}/><span aria-hidden="true">{day.label}</span></div>)}</div></fieldset>
     <FieldRow className="workflow-row"><div onChangeCapture={()=>onPending(key,true)}><TimePicker label="Heure de début" value={p.startTime} onChange={startTime=>{onPending(key,false);update('slots',p.id,{startTime});}}/></div><div onChangeCapture={()=>onPending(key,true)}><TimePicker label="Heure de fin" value={p.endTime} onChange={endTime=>{onPending(key,false);update('slots',p.id,{endTime});}}/></div></FieldRow>
    </>}
    {errors[key]&&<p className="field-error" role="alert">{errors[key]}</p>}
   </div>
  </PageSection></div>;})}
  {errors.schedule&&<p className="field-error" role="alert">{errors.schedule}</p>}
  <div><GhostButton size="sm" iconStart="plus" label={slots?'Ajouter un créneau':'Ajouter une période'} onClick={()=>onChange({[slots?'slots':'periods']:[...(slots?impact.slots:impact.periods),slots?emptySlot():emptyPeriod()]})}/></div>
 </div>;
}
