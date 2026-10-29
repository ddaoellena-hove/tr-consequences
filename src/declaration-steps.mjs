import {STEP_LABELS} from './traffic-model.mjs';
import {generalErrors,issue} from './validation.mjs';
const ICONS=['route','alert-triangle','calendar','mail-01','file-05'];
export function declarationSteps({data,impactIndex,step,completed,generalActive,publicationPending,fieldErrors={}}){
 const general=generalErrors(data),generalComplete=!Object.keys(general).length&&!publicationPending;
 const generalHasError=Object.keys(general).some(key=>key in fieldErrors);
 const steps=[{label:'Informations générales',icon:'info-circle',scope:'common',available:true,state:generalHasError?'error':generalActive?'current':generalComplete?'completed':'warning'},
 ...STEP_LABELS.map((label,index)=>({label,icon:ICONS[index],scope:'impact',available:index<=step||(completed[impactIndex]||[]).includes(index),state:index===step&&!generalActive?(Object.keys(fieldErrors).some(key=>!(key in general))?'error':'current'):(completed[impactIndex]||[]).includes(index)?(issue(data.impacts[impactIndex],index)?'warning':'completed'):'upcoming'}))];
 // The current impact remains reachable while editing the common information.
 steps[step+1].available=true;
 return {steps,current:generalActive?0:step+1};
}
