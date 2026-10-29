import React,{useState} from 'react';
import {TextInput,TextArea,Dropdown,Checkbox,SegmentedControl,GhostButton,PageSection,Drawer,InlineAlert} from '@ddaoellena/cadence-ui';
import {CHANNELS,workflowErrors} from './disruption-workflow.mjs';
import {WorkflowDate} from './ImpactSchedule.jsx';
const LANGUAGE_OPTIONS=[{id:'en',label:'Anglais'},{id:'es',label:'Espagnol'}];
export function ImpactMessages({impact,errors,onChange,onPending,pendingNotification=false,onValidation}){
 const [mask,setMask]=useState('none'),[translationsOpen,setTranslationsOpen]=useState(false),[translationTarget,setTranslationTarget]=useState('generic'),[language,setLanguage]=useState('en'),[check,setCheck]=useState(null);
 const single=impact.messageMode==='single';
 const edit=patch=>{setCheck(null);onChange(patch);};
 const apply=()=>edit({channelMessages:{...impact.channelMessages,...Object.fromEntries(impact.channels.map(c=>[c,{...(impact.channelMessages[c]||{}),title:impact.messageTitle,body:impact.genericMessage||''}]))}});
 const channelPatch=(c,patch)=>edit({channelMessages:{...impact.channelMessages,[c]:{...(impact.channelMessages[c]||{}),...patch}}});
 const translations=translationTarget==='generic'?impact.translations:(impact.channelMessages[translationTarget]?.translations||[]);
 const editTranslations=translations=>translationTarget==='generic'?edit({translations}):channelPatch(translationTarget,{translations});
 return <div className="workflow-stack">
  <div id="field-messageTitle"><TextInput label="Titre du message (obligatoire)" value={impact.messageTitle} state={errors.messageTitle?'error':'enabled'} helperText={errors.messageTitle||`${impact.messageTitle.length}/160 caractères`} onChange={e=>edit({messageTitle:e.target.value})}/></div>
  <div className="workflow-template"><Dropdown label="Masque de saisie" value={mask} options={[{id:'none',label:'Aucun modèle'},{id:'works',label:'Travaux programmés'},{id:'incident',label:'Incident sur le réseau'}]} onChange={setMask}/><GhostButton size="sm" label="Appliquer le modèle" disabled={mask==='none'} onClick={()=>edit({genericMessage:mask==='works'?'En raison de travaux, le service est modifié pendant les périodes indiquées. Consultez les itinéraires alternatifs avant votre déplacement.':'En raison d’un incident, le service est perturbé. Nous vous invitons à consulter les informations du réseau avant votre déplacement.'})}/></div>
  <fieldset id="field-channels" className="workflow-fieldset"><legend>1. Choisissez vos canaux de communication</legend><div className="workflow-choices">
   {CHANNELS.map(channel=><div className="workflow-choice" key={channel.id}><Checkbox aria-label={channel.label} state={impact.channels.includes(channel.id)?'checked':'unchecked'} onChange={checked=>edit({channels:checked?[...impact.channels,channel.id]:impact.channels.filter(c=>c!==channel.id)})}/><span aria-hidden="true">{channel.label}</span></div>)}
  </div>{errors.channels&&<p className="field-error" role="alert">{errors.channels}</p>}</fieldset>
  <PageSection title="2. Saisissez votre message" headingLevel={4} gap={16}>
   <div><SegmentedControl aria-label="Personnalisation des messages" value={impact.messageMode} options={[{value:'single',label:'Message unique'},{value:'custom',label:'Message personnalisé'}]} onChange={messageMode=>edit({messageMode})}/></div>
   <p className="workflow-muted">{single?'Le même titre et le même message seront utilisés pour tous les canaux sélectionnés.':'Vous pouvez adapter le titre et le message pour chacun des canaux sélectionnés.'}</p>
   <div id="field-message"><TextArea label={single?'Message unique':'Message générique'} value={impact.genericMessage||''} state={errors.message?'error':'enabled'} helperText={errors.message||'Texte simple, sans mise en forme HTML.'} onChange={e=>edit({genericMessage:e.target.value})}/></div>
   <div className="workflow-actions"><GhostButton size="sm" iconStart="translate-01" label={`Traductions (${impact.translations.length})`} onClick={()=>{setTranslationTarget('generic');setTranslationsOpen(true);}}/>{!single&&<GhostButton size="sm" label="Appliquer le message aux canaux" onClick={apply} disabled={!impact.channels.length}/>}</div>
   {!single&&impact.channels.map(c=><div id={`field-channel-${c}`} key={c}><PageSection title={CHANNELS.find(ch=>ch.id===c)?.label||c} headingLevel={4} surface="card" gap={0}>
    <div className="workflow-card-content"><TextInput label={`Objet · ${CHANNELS.find(ch=>ch.id===c)?.label}`} value={impact.channelMessages[c]?.title||''} helperText={`${(impact.channelMessages[c]?.title||'').length}/160 caractères`} onChange={e=>channelPatch(c,{title:e.target.value})}/><TextArea label={`Message · ${CHANNELS.find(ch=>ch.id===c)?.label}`} value={impact.channelMessages[c]?.body||''} onChange={e=>channelPatch(c,{body:e.target.value})}/><div><GhostButton size="sm" iconStart="translate-01" label={`Traductions (${impact.channelMessages[c]?.translations?.length||0})`} onClick={()=>{setTranslationTarget(c);setTranslationsOpen(true);}}/></div>{errors[`channel-${c}`]&&<p className="field-error" role="alert">{errors[`channel-${c}`]}</p>}</div>
   </PageSection></div>)}
  </PageSection>
  <div id="field-notification"><WorkflowDate label="Date et heure de notification (facultatif)" value={impact.notificationAt} onChange={notificationAt=>edit({notificationAt})} onPending={v=>onPending('notification',v)}/>{impact.notificationAt&&<GhostButton size="sm" label="Retirer la notification" onClick={()=>{onPending('notification',false);edit({notificationAt:''});}}/>}{errors.notification&&<p className="field-error" role="alert">{errors.notification}</p>}<p className="workflow-muted">Date conservée dans le brouillon ; aucun message n’est envoyé par ce prototype.</p></div>
  <div id="field-translations">{errors.translations&&<p className="field-error" role="alert">{errors.translations}</p>}</div>
  <PageSection title="3. Vérifiez les messages pour chaque canal" headingLevel={4} gap={12}>
   <div><GhostButton size="sm" iconStart="check" label="Vérifier les messages" onClick={()=>{const result={...workflowErrors(impact,3),...(pendingNotification?{notification:'Corrigez et confirmez la date et l’heure de notification.'}:{})};setCheck(result);onValidation?.(Object.keys(result).length===0);}}/></div>
   {check&&(Object.keys(check).length?<InlineAlert type="error" title="Messages à compléter">{Object.values(check).join(' ')}</InlineAlert>:<InlineAlert type="success" title="Messages vérifiés">Les messages des canaux sélectionnés sont renseignés. Cette vérification est locale.</InlineAlert>)}
  </PageSection>
  <Drawer width="lg" isOpen={translationsOpen} onClose={()=>setTranslationsOpen(false)} title={translationTarget==='generic'?'Traductions du message générique':`Traductions · ${CHANNELS.find(c=>c.id===translationTarget)?.label||''}`} subtitle="Ajoutez et complétez les traductions par langue pour ce message." secondaryAction={{label:'Fermer',onClick:()=>setTranslationsOpen(false)}}>
   <div className="workflow-stack"><p className="workflow-muted">Traductions saisies manuellement. Elles sont conservées avec cet impact ; aucune traduction automatique n’est générée.</p>
    <Dropdown label="Langue" options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage}/><div><GhostButton size="sm" iconStart="plus" label="Ajouter la traduction" disabled={translations.some(t=>t.locale===language)} onClick={()=>editTranslations([...translations,{locale:language,title:'',body:''}])}/></div>
    {translations.map(t=><PageSection title={LANGUAGE_OPTIONS.find(l=>l.id===t.locale)?.label||t.locale} key={t.locale} headingLevel={3} gap={12} actions={<GhostButton size="sm" icon="trash" tone="danger" aria-label="Supprimer" onClick={()=>editTranslations(translations.filter(v=>v.locale!==t.locale))}/>}>
     <TextInput label="Titre traduit" value={t.title} onChange={e=>editTranslations(translations.map(v=>v.locale===t.locale?{...v,title:e.target.value}:v))}/><TextArea label="Message traduit" value={t.body} onChange={e=>editTranslations(translations.map(v=>v.locale===t.locale?{...v,body:e.target.value}:v))}/>
    </PageSection>)}
   </div>
  </Drawer>
 </div>;
}
