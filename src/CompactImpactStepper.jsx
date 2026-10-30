import React from 'react';
import {Dropdown,Stepper} from '@ddaoellena/cadence-ui';
const STATE_LABELS={current:'En cours',completed:'Terminée',upcoming:'À venir',error:'En erreur',warning:'À vérifier'};
export function CompactImpactStepper({steps,current,impactNumber,compact,onStepClick}){
 const step=steps[current],scope=step.scope==='common'?'Informations communes':`Impact n° ${impactNumber}`;
 // Stepper names the active step only when its state is "current", not when it holds an error.
 const context=step.state==='current'?scope:<>{scope} · {current+1}/{steps.length} · <strong>{step.label}</strong></>;
 return <nav className="footer-step-navigation" aria-label="Étapes de la déclaration">
  {compact?<><Dropdown variant="button" placement="top" aria-label="Choisir une étape de la déclaration" value={String(current)} options={steps.map((s,index)=>({id:String(index),label:`${index+1}/${steps.length} · ${s.label} — ${STATE_LABELS[s.state]}`,disabled:!s.available}))} onChange={value=>onStepClick(Number(value))}/><p className="footer-step-context" aria-live="polite">{scope}</p></>
  :<Stepper density="compact" context={context} steps={steps.map((s,index)=>({...s,id:String(index)}))} onStepClick={id=>onStepClick(Number(id))}/>}
 </nav>;
}
