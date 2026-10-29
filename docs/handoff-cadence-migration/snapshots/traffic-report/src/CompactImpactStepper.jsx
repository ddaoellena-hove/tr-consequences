import React from 'react';
import {Dropdown,GhostButton,Icons} from '@ddaoellena/cadence-ui';
const STATE_LABELS={current:'En cours',completed:'Terminée',upcoming:'À venir',error:'En erreur',warning:'À vérifier'};
export function CompactImpactStepper({steps,current,impactNumber,compact,onStepClick}){
 return <nav className="footer-step-navigation" aria-label="Étapes de la déclaration">
  {compact?<Dropdown variant="button" aria-label="Choisir une étape de la déclaration" value={String(current)} options={steps.map((step,index)=>({id:String(index),label:`${index+1}/${steps.length} · ${step.label} — ${STATE_LABELS[step.state]}`,disabled:!step.available}))} onChange={value=>onStepClick(Number(value))}/>:<ol className="footer-stepper">{steps.map((step,index)=><li key={index} className="footer-stepper-step" data-state={step.state} aria-current={index===current?'step':undefined}>
   <GhostButton size="sm" icon={step.icon} aria-label={`${index+1}/${steps.length} · ${step.label} — ${STATE_LABELS[step.state]}`} disabled={!step.available} onClick={()=>onStepClick(index)}/>
   <span className="footer-step-state" aria-hidden="true">{step.state==='completed'?<Icons icon="check" size={8}/>:['error','warning'].includes(step.state)?'!':null}</span>
  </li>)}</ol>}
  <p className="footer-step-context" aria-live="polite">{steps[current].scope==='common'?'Informations communes':`Impact n° ${impactNumber}`}{!compact&&<> · {current+1}/{steps.length} · <strong>{steps[current].label}</strong></>}</p>
 </nav>;
}
