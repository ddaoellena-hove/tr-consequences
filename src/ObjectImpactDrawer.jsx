import React,{useEffect,useMemo,useState} from 'react';
import {Drawer,Dropdown,Autocomplete,ModeFilter,PageSection,Checkbox,GhostButton,PrimaryButton,EmptyState,InlineAlert,Toggle,Modal,TableCard,DescriptionList,Accordion,Icons} from '@ddaoellena/cadence-ui';
import {OBJECT_TYPES,uid,localDay} from './disruption-workflow.mjs';
import {catalogueFor,NETWORKS,POIS,ACCESSES,MODE_OPTIONS,matchesModes,buildObject,stageObject,mergeObjectSelection,demoCourses} from './object-catalogue.mjs';
import {DisruptionObjectIcon} from './DisruptionObjectIcon.jsx';
import {ObjectSelectionCard,ObjectLineBadges} from './ObjectSelectionCard.jsx';
import {WorkflowDate} from './ImpactSchedule.jsx';
import './object-drawer.css';
const time=value=>new Date(value).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const Choice=({label,checked,onChange,children})=><div className="object-choice"><Checkbox aria-label={label} state={checked?'checked':'unchecked'} onChange={onChange}/><div>{children||label}</div></div>;
export function ObjectImpactDrawer({isOpen,onClose,impact,stations,line,editingObject,onConfirm}){
 // Mount Cadence's Drawer closed first, including after lazy loading or editing.
 // Its initial isOpen=true state skips the built-in entrance transition.
 const [visible,setVisible]=useState(false);
 useEffect(()=>{setVisible(isOpen);},[isOpen]);
 const catalogue=useMemo(()=>catalogueFor(line,stations),[line,stations]);
 const [type,setType]=useState(editingObject?.scope||''),[modes,setModes]=useState([]),[basket,setBasket]=useState(editingObject?[structuredClone(editingObject)]:[]);
 const [lineId,setLineId]=useState(editingObject?.lineIds?.[0]||catalogue.lines.find(l=>l.name===editingObject?.lineName)?.id||'');
 const [areaId,setAreaId]=useState(catalogue.areas.find(a=>a.name===editingObject?.target)?.id||'');
 const [firstId,setFirstId]=useState(catalogue.areas.find(a=>a.name===(editingObject?.fromName||stations[editingObject?.from]))?.id||'');
 const [lastId,setLastId]=useState(catalogue.areas.find(a=>a.name===(editingObject?.toName||stations[editingObject?.to]))?.id||'');
 const [directionSelections,setDirectionSelections]=useState(editingObject?.directionSelections||{}),[accessIds,setAccessIds]=useState(editingObject?.accessIds||[]);
 const [poiType,setPoiType]=useState('all'),[showMap,setShowMap]=useState(false),[courseOpen,setCourseOpen]=useState(false),[course,setCourse]=useState(editingObject?.course||null),[courseChoice,setCourseChoice]=useState('');
 const [courseDate,setCourseDate]=useState(localDay(new Date())),[courseDatePending,setCourseDatePending]=useState(false),[courseDirection,setCourseDirection]=useState(editingObject?.course?.direction||'');
 const [editingStaged,setEditingStaged]=useState(editingObject?.id||null),[notice,setNotice]=useState('');
 const filteredLines=catalogue.lines.filter(l=>matchesModes(modes,l));
 const areaOptions=catalogue.areas.filter(a=>a.lines.some(l=>matchesModes(modes,l)));
 const chosenLine=catalogue.lines.find(l=>l.id===lineId),area=catalogue.areas.find(a=>a.id===areaId),first=catalogue.areas.find(a=>a.id===firstId),last=catalogue.areas.find(a=>a.id===lastId);
 const section=['section','railSection'].includes(type),relatedLines=section?filteredLines.filter(l=>first&&last&&first.id!==last.id&&l.stops.includes(first.name)&&l.stops.includes(last.name)):type==='stop'?area?.lines.filter(l=>matchesModes(modes,l))||[]:chosenLine?[chosenLine]:[];
 const selectedLines=relatedLines.filter(l=>directionSelections[l.id]?.length);
 const hasConfiguration=type==='line'?Boolean(chosenLine):section?Boolean(first&&last):['stop','access'].includes(type)?Boolean(area):type==='course'?Boolean(chosenLine):false;
 const selectionValid=type==='access'?Boolean(area&&accessIds.length&&selectedLines.length):type==='course'?Boolean(chosenLine&&course):selectedLines.length>0;
 const courses=useMemo(()=>chosenLine&&courseDirection&&courseDate&&!courseDatePending?demoCourses(chosenLine,courseDirection,courseDate):[],[chosenLine,courseDirection,courseDate,courseDatePending]);
 const selectedCourse=courses.find(c=>c.id===courseChoice);
 function clearConfiguration(){setLineId('');setAreaId('');setFirstId('');setLastId('');setDirectionSelections({});setAccessIds([]);setCourse(null);setCourseDirection('');setCourseChoice('');setShowMap(false);setEditingStaged(null);setNotice('');}
 function changeType(value){setType(value);clearConfiguration();}
 function selectLine(value){setLineId(value||'');setCourse(null);setCourseDirection('');setDirectionSelections(value?{[value]:catalogue.lines.find(l=>l.id===value)?.directions||[]}:{});}
 function toggleDirection(l,d,checked){setDirectionSelections(prev=>({...prev,[l.id]:checked?[...new Set([...(prev[l.id]||[]),d])]:(prev[l.id]||[]).filter(v=>v!==d)}));}
 function put(object){
  const replacingId=editingStaged||editingObject?.id;
  const candidate={...object,id:replacingId||uid()};
  const base=basket.filter(o=>o.id!==replacingId),next=stageObject(base,candidate);
  setBasket(next);clearConfiguration();setNotice(next.length===base.length?'Cet objet est déjà dans la sélection.':'Objet ajouté. Vous pouvez en sélectionner d’autres avant de confirmer.');
 }
 function addConfiguration(){if(!selectionValid)return;put(buildObject({scope:type,selectedLines:type==='course'?[chosenLine]:selectedLines,directionSelections,area,first,last,accessIds,course,contextStations:stations}));}
 function editStaged(object){
  setType(object.scope);setEditingStaged(object.id);setLineId(object.lineIds?.[0]||catalogue.lines.find(l=>l.name===object.lineName)?.id||'');
  setAreaId(catalogue.areas.find(a=>a.name===object.target)?.id||'');setFirstId(catalogue.areas.find(a=>a.name===(object.fromName||stations[object.from]))?.id||'');setLastId(catalogue.areas.find(a=>a.name===(object.toName||stations[object.to]))?.id||'');
  setDirectionSelections(object.directionSelections||{});setAccessIds(object.accessIds||[]);setCourse(object.course||null);setCourseDirection(object.course?.direction||'');setNotice('Modifiez la configuration puis ajoutez-la à la sélection.');
 }
 const areaAutocomplete=(label,value,onChange,options=areaOptions)=><Autocomplete label={label} placeholder="Nom ou identifiant de l’arrêt" value={value} options={options.map(a=>({id:a.id,label:a.name,description:'Catalogue de démonstration',content:<ObjectLineBadges lines={a.lines.filter(l=>matchesModes(modes,l))}/>}))} onChange={v=>onChange(v||'')}/>;
 const toggleAccess=(id,checked)=>setAccessIds(prev=>checked?[...new Set([...prev,id])]:prev.filter(v=>v!==id));
 return <><Drawer isOpen={visible} onClose={onClose} title={editingObject?'Modifier l’objet d’impact':'Ajouter des objets impactés'} subtitle={editingObject?'Modifiez l’objet dans votre sélection, puis confirmez.':'Vous pouvez ajouter plusieurs objets, de types différents, à cet impact. Préparez votre sélection puis ajoutez-la en une seule fois.'} width="lg" className="object-impact-drawer"
   onSubmit={event=>{event.preventDefault();if(basket.length)onConfirm(mergeObjectSelection(impact.objects,basket,editingObject?.id));}}
   primaryAction={{label:editingObject?'Confirmer':`Ajouter à l’impact${basket.length?` (${basket.length})`:''}`,disabled:!basket.length}} secondaryAction={{label:'Annuler',onClick:onClose}}>
  <div className="object-drawer-stack">
   <Dropdown label="Sélectionnez le type d’objet impacté" placeholder="Type d’objet impacté" value={type} options={OBJECT_TYPES.map(t=>({...t,icon:<DisruptionObjectIcon scope={t.id}/>}))} onChange={changeType}/>
   {type&&<>
    {type!=='poi'&&<fieldset className="object-drawer-filter"><legend><span className="object-filter-title"><Icons icon="filter-lines" size={16}/>Filtres par mode de transport</span></legend><ModeFilter aria-label="Filtrer les objets par mode" modes={MODE_OPTIONS} labels={{train:'Train / Transilien'}} value={modes} allLabel="Tous" onChange={value=>{setModes(value);clearConfiguration();}}/></fieldset>}
    {type==='network'&&<Autocomplete label="Réseau" placeholder="Rechercher un réseau" value="" options={NETWORKS.filter(n=>!modes.length||n.modes.some(m=>modes.includes(m))).map(n=>({id:n.id,label:n.name}))} onChange={id=>{const network=NETWORKS.find(n=>n.id===id);if(network)put(buildObject({scope:type,network,contextStations:stations}));}}/>}
    {['line','course'].includes(type)&&<Autocomplete label="Rechercher une ligne" placeholder="Nom ou identifiant de ligne" value={lineId} options={filteredLines.map(l=>({id:l.id,label:l.name,description:l.operator,content:<ObjectLineBadges lines={[l]}/>}))} onChange={selectLine}/>}
    {section&&<>{areaAutocomplete('Première gare ou arrêt impacté',firstId,v=>{setFirstId(v);setLastId('');setDirectionSelections({});})}{areaAutocomplete('Dernière gare ou arrêt impacté',lastId,v=>{setLastId(v);const destination=catalogue.areas.find(a=>a.id===v);setDirectionSelections(Object.fromEntries(filteredLines.filter(l=>first&&destination&&first.id!==destination.id&&l.stops.includes(first.name)&&l.stops.includes(destination.name)).map(l=>[l.id,l.directions])));})}
     {first&&last&&relatedLines.length===0&&<InlineAlert type="warning" title="Aucune ligne commune">Choisissez deux arrêts distincts desservis par une même ligne du catalogue.</InlineAlert>}
    </>}
    {type==='stop'&&areaAutocomplete('Rechercher un arrêt de déviation',areaId,v=>{setAreaId(v);setDirectionSelections({});})}
    {type==='stopArea'&&areaAutocomplete('Rechercher une zone d’arrêt','',v=>{const selected=catalogue.areas.find(a=>a.id===v);if(selected)put(buildObject({scope:type,area:selected,selectedLines:selected.lines.filter(l=>matchesModes(modes,l)),contextStations:stations}));})}
    {type==='stopPoint'&&<Autocomplete label="Rechercher un arrêt" placeholder="Nom, ligne ou direction" value="" options={areaOptions.flatMap(a=>a.lines.filter(l=>matchesModes(modes,l)).flatMap(l=>l.directions.map((d,index)=>({id:`${a.id}-${l.id}-${index}`,label:`${a.name} · ${l.name} · ${d}`,description:l.operator,content:<ObjectLineBadges lines={[l]}/>}))))} onChange={id=>{
     const point=areaOptions.flatMap(a=>a.lines.filter(l=>matchesModes(modes,l)).flatMap(l=>l.directions.map((d,index)=>({id:`${a.id}-${l.id}-${index}`,name:a.name,line:l,direction:d})))).find(p=>p.id===id);
     if(point)put(buildObject({scope:type,stopPoint:point,selectedLines:[point.line],directionSelections:{[point.line.id]:[point.direction]},contextStations:stations}));
    }}/>}
    {type==='poi'&&<><Dropdown label="Filtrer par type de POI" value={poiType} options={[{id:'all',label:'Tous les types'},{id:'health',label:'Santé'},{id:'park',label:'Parcs et jardins'},{id:'sport',label:'Sport'}]} onChange={setPoiType}/><p className="workflow-muted">Recherchez un point d’intérêt par son nom ou son identifiant.</p><Autocomplete label="Point d’intérêt" placeholder="Rechercher un point d’intérêt" value="" options={POIS.filter(p=>poiType==='all'||p.type===poiType).map(p=>({id:p.id,label:p.name,description:p.address}))} onChange={id=>{const poi=POIS.find(p=>p.id===id);if(poi)put(buildObject({scope:type,poi,contextStations:stations}));}}/></>}
    {type==='access'&&areaAutocomplete('Arrêt concerné',areaId,v=>{setAreaId(v);setAccessIds([]);setDirectionSelections({});},areaOptions.filter(a=>a.name==='Saint-Lazare'))}
    {hasConfiguration&&<PageSection title={type==='access'?area.name:type==='course'?chosenLine.name:'Configurer la sélection'} headingLevel={3} surface="card" gap={0} className="object-configuration"><div className="workflow-card-content">
     {type!=='access'&&type!=='course'&&relatedLines.map(l=><PageSection title={l.name} headingLevel={4} key={l.id} gap={12} actions={<ObjectLineBadges lines={[l]}/>}>
      <div className="object-drawer-choices">{l.directions.map(d=><Choice key={d} label={`${l.name} · ${d}`} checked={(directionSelections[l.id]||[]).includes(d)} onChange={checked=>toggleDirection(l,d,checked)}>{d}</Choice>)}</div>
      {type==='railSection'&&first&&last&&<Accordion items={[{id:l.id,title:'Voir les gares impactées',content:<ol>{l.stops.slice(Math.min(l.stops.indexOf(first.name),l.stops.indexOf(last.name)),Math.max(l.stops.indexOf(first.name),l.stops.indexOf(last.name))+1).map(s=><li key={s}>{s}</li>)}</ol>}]}/>}
     </PageSection>)}
     {type==='access'&&<><Dropdown label="Ligne et direction" placeholder="Sélectionner une direction" value={Object.entries(directionSelections).flatMap(([id,ds])=>ds.map(d=>`${id}|${d}`))[0]||''} options={area.lines.flatMap(l=>l.directions.map(d=>({id:`${l.id}|${d}`,label:`${l.name} · ${d}`})))} onChange={value=>{const [id,d]=value.split('|');setLineId(id);setDirectionSelections({[id]:[d]});}}/>
      <div className="object-drawer-choices">{ACCESSES.map(a=><Choice key={a.id} label={`${a.id} — ${a.name}`} checked={accessIds.includes(a.id)} onChange={checked=>toggleAccess(a.id,checked)}/>)}</div>
      <div className="workflow-choice"><Toggle aria-label="Afficher le plan des accès" state={showMap?'active':'default'} onChange={setShowMap}/><span>Afficher sur le plan</span></div>
      {showMap&&<figure className="object-access-map"><div className="object-access-map-image"><img src="/figma/access-basemap.png" alt="Plan de la gare Saint-Lazare"/>{ACCESSES.map(a=><div key={a.id} className="object-access-marker" data-access={a.id} data-selected={accessIds.includes(a.id)}><GhostButton size="sm" label={a.id} aria-label={`Accès ${a.id} — ${a.name}`} onClick={()=>toggleAccess(a.id,!accessIds.includes(a.id))}/></div>)}</div><figcaption>Plan indicatif de démonstration · choisissez un numéro pour sélectionner un accès.</figcaption></figure>}
     </>}
     {type==='course'&&<><Dropdown label="Sélectionner une direction" placeholder="Direction" value={courseDirection} options={chosenLine.directions.map(d=>({id:d,label:d}))} onChange={d=>{setCourseDirection(d);setCourse(null);setCourseChoice('');setDirectionSelections({[chosenLine.id]:[d]});}}/>
      <WorkflowDate label="Jour de circulation" withTime={false} value={`${courseDate}T00:00`} onChange={value=>{setCourseDate(value);setCourse(null);setCourseChoice('');}} onPending={setCourseDatePending}/>
      <div><GhostButton size="sm" label="Choisir une course" disabled={!courseDirection||courseDatePending} onClick={()=>setCourseOpen(true)}/></div>
      {course&&<DescriptionList items={[{id:'course',label:'Course choisie',value:course.name},{id:'start',label:'Départ',value:new Date(course.start).toLocaleString('fr-FR')},{id:'end',label:'Arrivée',value:new Date(course.end).toLocaleString('fr-FR')}]}/>}</>}
     <div className="workflow-actions"><GhostButton size="sm" iconStart="plus" label={editingStaged?'Mettre à jour la sélection':'Ajouter à la sélection'} disabled={!selectionValid} onClick={addConfiguration}/><GhostButton size="sm" label="Réinitialiser" onClick={clearConfiguration}/></div>
    </div></PageSection>}
    <PageSection title={`Votre sélection (${basket.length} objet${basket.length>1?'s':''})`} description={editingObject?'Confirmez pour appliquer vos modifications.':'Continuez à rechercher des objets : ils seront ajoutés ensemble à l’impact lors de la confirmation.'} headingLevel={3} gap={12} className="object-drawer-basket">
     {!basket.length?<EmptyState size="inline" title="Aucun objet sélectionné" illustration={<img src="/figma/object-empty.svg" alt=""/>}/>:basket.map(o=><ObjectSelectionCard key={o.id} object={o} stations={stations} onEdit={()=>editStaged(o)} onRemove={()=>{setBasket(prev=>prev.filter(v=>v.id!==o.id));if(editingStaged===o.id)clearConfiguration();}}/>)}
    </PageSection>
   </>}
   {notice&&<p className="workflow-muted" role="status">{notice}</p>}
   <p className="workflow-muted">Catalogue et horaires de démonstration.</p>
  </div>
 </Drawer>
 <Modal isOpen={courseOpen} onClose={()=>setCourseOpen(false)} title="Choisir une course" size="large" primaryAction={{label:'Impacter',disabled:!selectedCourse,onClick:()=>{setCourse(selectedCourse);setCourseOpen(false);}}} secondaryAction={{label:'Annuler',onClick:()=>setCourseOpen(false)}}>
  <div className="object-drawer-stack"><p className="workflow-muted">Sélectionnez une course du {courseDate}. Les horaires ci-dessous sont fictifs.</p>{courses.map(c=><TableCard key={c.id} selectable={false} title={c.name} state={courseChoice===c.id?'selected':'default'} actions={<GhostButton size="sm" label={courseChoice===c.id?'Sélectionnée':'Choisir'} onClick={()=>setCourseChoice(c.id)}/>} columns={[{key:'start',flex:1,content:<p>Départ : {time(c.start)}</p>},{key:'end',flex:1,content:<p>Arrivée : {time(c.end)}</p>}]}/>)}{selectedCourse&&<DescriptionList items={selectedCourse.stops.map((s,index)=>({id:String(index),label:s.station,value:time(s.time)}))}/>}</div>
 </Modal></>;
}
