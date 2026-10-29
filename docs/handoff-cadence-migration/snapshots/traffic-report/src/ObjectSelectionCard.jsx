import React from 'react';
import {TableCard,GhostButton,LineBadge} from '@ddaoellena/cadence-ui';
import {OBJECT_TYPES,objectTitle} from './disruption-workflow.mjs';
import {DisruptionObjectIcon} from './DisruptionObjectIcon.jsx';
export function ObjectLineBadges({lines=[]}){return <div className="object-line-badges">{lines.map((line,index)=><span key={`${line.code}-${line.mode}-${index}`} className="object-line-label">{line.mode!=='funicular'&&<LineBadge code={line.code} mode={line.mode} color={line.color} size="sm"/>}<span>{line.name}</span></span>)}</div>;}
export function ObjectSelectionCard({object,stations,onEdit,onRemove}){
 return <TableCard selectable={false} className="object-selection-card" title={OBJECT_TYPES.find(t=>t.id===object.scope)?.label||'Objet impacté'} iconElement={<DisruptionObjectIcon scope={object.scope}/>}
  actions={<>{onEdit&&<GhostButton size="sm" icon="edit-02" aria-label="Modifier" onClick={onEdit}/>}<GhostButton size="sm" icon="trash" tone="danger" aria-label="Supprimer" onClick={onRemove}/></>}
  columns={[{key:'details',flex:1,content:<div className="object-selection-details"><strong>{object.scope==='line'?object.lineName:objectTitle(object,stations)}</strong><ObjectLineBadges lines={object.lines}/>{object.direction&&<p>{object.direction}</p>}{object.course&&<p>{new Date(object.course.start).toLocaleString('fr-FR')} → {new Date(object.course.end).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p>}</div>}]}/>;
}
