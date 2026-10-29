import './workflow.css';
import { STATIONS, STEP_LABELS, SEVERITIES, SEVERITY_MAP, initial, removeFormImpact } from './traffic-model.mjs';
import Dashboard from './Dashboard.jsx';
import {declarationSteps} from './declaration-steps.mjs';
import {CompactImpactStepper} from './CompactImpactStepper.jsx';
import {ImpactObjects} from './ImpactObjects.jsx';
import {ImpactSchedule} from './ImpactSchedule.jsx';
import {ImpactMessages} from './ImpactMessages.jsx';
import {DisruptionSummary} from './DisruptionSummary.jsx';
import {normalizeWorkflow,emptyWorkflowImpact,projectImpact} from './disruption-workflow.mjs';
import {GeneralInformation} from './GeneralInformation.jsx';
import {withGeneralInformation} from './general-information.mjs';
import { upsertRecord, makeId } from './dashboard-data.mjs';
import React, { useState, useEffect, useMemo } from 'react';
import { issue, impactErrors, generalErrors, validDate, canCreateDisruption } from './validation.mjs';
import { LineDiagram } from './LineDiagram.jsx';
import {consequenceDiagrams} from './consequence-diagrams.mjs';
import {
  PrimaryButton,
  GhostButton,
  Dropdown,
  InlineAlert,
  Indicator,
  LineBadge,
  Icons,
  Sidebar,
  AppLayout,
  PageHeader,
  Breadcrumbs,
  Accordion, PageSection, FormActions, ProgressBar, Modal, Toaster, toast,
  Badge,
  EmptyState, SummaryList,
} from '@ddaoellena/cadence-ui';

const DIAGRAM_OPTIONS={colorCode:true,showTag:true,animate:true,speed:'normale',labels:true};

function loadDraft() {
  try {
    const s = JSON.parse(localStorage.getItem('traffic-report-draft'));
    if (typeof s?.title === 'string' && typeof s?.cause === 'string' && s?.impacts?.length) {
      s.impacts = s.impacts.map((imp) => {
        let severity = imp.severity;
        if (severity === 'interrupted') severity = 'interrompu';
        if (severity === 'reduced') severity = 'reduit';
        if (severity === 'delayed') severity = 'perturbe';
        return { ...imp, severity, start: validDate(imp.start) ? imp.start : '', end: validDate(imp.end) ? imp.end : '' };
      });
      if (
        s.impacts.every(
          (i) =>
            (SEVERITY_MAP[i.severity] || i.severity === '') &&
            Number.isInteger(i.from) &&
            i.from >= 0 &&
            Number.isInteger(i.to) &&
            i.to <= 5 &&
            i.from <= 5 && i.to >= 0 &&
            ['start', 'end', 'message'].every((k) => typeof i[k] === 'string')
        )
      ) {
        return normalizeWorkflow(withGeneralInformation(s));
      }
    }
  } catch {}
  return null;
}


// The domain model remains product-specific; presentation uses Cadence.
function SeverityField({ value, onChange }) {
  return <Dropdown label="Sévérité" value={value} onChange={onChange}
    options={SEVERITIES.map(s => ({ id: s.id, divider: s.id === 'modifie',
      label: `${s.label} · ${s.passant ? 'passant' : 'non passant'}`,
      icon: <span className="severity-dot" data-severity={s.id} aria-hidden="true" />
    }))} />;
}
function ConsequenceCard({ sev }) {
  return <div className="consequence-wrap"><InlineAlert type="information" title="Conséquence sur l’objet">
    <p>{sev.lead} <strong>{sev.conseq}</strong></p>
  </InlineAlert></div>;
}
const notify = title => toast({type:'information', title});

export default function App() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const [screen, setScreen] = useState(() => window.location.hash === '#declaration' ? 'form' : 'dashboard');
  useEffect(() => {document.title = screen === 'dashboard' ? 'Traffic Report — Toutes les perturbations' : 'Traffic Report — Déclaration de perturbation';}, [screen]);
  useEffect(() => { const update=()=>setScreen(window.location.hash === '#declaration' ? 'form' : 'dashboard'); window.addEventListener('hashchange',update); return()=>window.removeEventListener('hashchange',update); }, []);
  const [restored] = useState(loadDraft);
  const [data, setData] = useState(() => normalizeWorkflow(restored || initial()));
  const [current, setCurrent] = useState(0);
  const [impactToDelete, setImpactToDelete] = useState(null);
  const [step, setStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [datePending, setDatePending] = useState({});
  const [impactSteps, setImpactSteps] = useState({0: 0});
  const [completed, setCompleted] = useState({});
  const [saveState, setSaveState] = useState(
    restored ? 'Brouillon restauré depuis cet appareil.' : 'Vos modifications ne sont pas encore enregistrées.'
  );
  const [record, setRecord] = useState(null);
  const [activeNav, setActiveNav] = useState('new');
  const [network, setNetwork] = useState('idfm');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [generalVersion, setGeneralVersion] = useState(0);
  const [generalActive,setGeneralActive]=useState(()=>Object.keys(generalErrors(data)).length>0);
  const [publicationPending, setPublicationPending] = useState(false);

  const generalComplete = Object.keys(generalErrors(data)).length === 0 && !publicationPending;
  const stations = data.stations || STATIONS;
  const line = data.line || {code:'12',mode:'bus',name:'Ligne 12'};
  const i = data.impacts[current];
  const sev = SEVERITY_MAP[i.severity] || SEVERITIES[0];
  const diagrams=consequenceDiagrams(i,stations,line);



  const navigation=declarationSteps({data,impactIndex:current,step,completed,generalActive,publicationPending,fieldErrors});
  function openGeneral() {
    setGeneralActive(true);setGeneralVersion(v=>v+1);
    requestAnimationFrame(()=>{const trigger=document.querySelector('.general .accordion__trigger');trigger?.focus({preventScroll:true});trigger?.scrollIntoView({behavior:'smooth',block:'center'});});
  }
  function continueGeneral() {
    const errors={...generalErrors(data),...(publicationPending?{publicationStart:'Corrigez et confirmez la date de publication.'}:{})};
    if(Object.keys(errors).length)return showFieldErrors(errors);
    setFieldErrors({});go(step);
    requestAnimationFrame(()=>document.querySelector('.impact-head')?.scrollIntoView({behavior:'smooth',block:'center'}));
  }

  function change(update) {
    setData((d) => ({ ...d, ...update }));
    setVerified(false);
    setError('');
    setFieldErrors({});
    setSaveState('Modifications non enregistrées');
  }

  const creationReady=!verified&&canCreateDisruption(data,completed,{publicationPending,datePending});
  function updateDatePending(key,value) {
    setDatePending(prev=>({...prev,[key]:value}));
    if(value){const editedStep=key==='notification'?3:2;setCompleted(prev=>({...prev,[current]:(prev[current]||[]).filter(n=>n<editedStep)}));}
  }

  function updateImpact(patch) {
    if ('start' in patch || 'end' in patch) setDatePending(prev => ({...prev, ...('start' in patch ? {start:false} : {}), ...('end' in patch ? {end:false} : {})}));
    change({ impacts: data.impacts.map((item, n) => (n === current ? projectImpact({ ...item, ...patch },stations) : item)) });
    const editedStep = 'objects' in patch || 'from' in patch || 'to' in patch ? 0 : 'severity' in patch ? 1 : ['periods','slots','scheduleMode'].some(k=>k in patch) ? 2 : 3;
    setCompleted(prev => ({...prev, [current]: (prev[current] || []).filter(n => n < editedStep)}));
  }

  function showFieldErrors(errors, openGeneral = false) {
    setFieldErrors(errors);
    const entries = Object.entries(errors);
    if (!entries.length) return;
    toast({
      type: 'warning',
      title: entries.length === 1 ? 'Un champ est à compléter' : `${entries.length} champs sont à compléter`,
      description: entries[0][1],
      duration: 6000,
      actions: [{label: 'Corriger', onClick: () => {
        if (openGeneral) {setGeneralActive(true);setGeneralVersion(v => v + 1);}
        requestAnimationFrame(() => {
          const field = document.getElementById(`field-${entries[0][0]}`);
          if (!field) return;
          const control = field.querySelector('input:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex="0"]');
          control?.focus({preventScroll: true});
          field.scrollIntoView({behavior: 'smooth', block: 'center'});
        });
      }}],
    });
  }

  function go(n) {
    setGeneralActive(false);
    if(n>step){
      for(let target=0;target<n;target++){
        const pending=Object.fromEntries(Object.entries(datePending).filter(([key,value])=>value&&(key==='notification'?target===3:target===2)).map(([key])=>[key,'Corrigez et confirmez la date ou l’heure saisie.']));
        const errors={...impactErrors(i,target),...pending};
        if(Object.keys(errors).length){setStep(target);setImpactSteps(prev=>({...prev,[current]:target}));return showFieldErrors(errors);}
      }
      setCompleted(prev=>({...prev,[current]:Array.from({length:n},(_,index)=>index)}));
    }
    setError(''); setFieldErrors({}); setDatePending({}); setStep(n);
    setImpactSteps(prev => ({...prev, [current]:n}));
  }

  function save() {
    try {
      const saved = upsertRecord(data, 'draft');
      setData(saved);
      localStorage.setItem('traffic-report-draft', JSON.stringify(saved));
      setSaveState(
        'Brouillon enregistré sur cet appareil · ' +
          new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
      notify('Brouillon enregistré sur cet appareil.');
    } catch {
      setError('Le stockage local n’est pas disponible.');
    }
  }

  function validate() {
    if(!creationReady)return;
    const general = {...generalErrors(data), ...(publicationPending ? {publicationStart:'Corrigez et confirmez la date et l’heure de publication saisies.'} : {})};
    if (Object.keys(general).length) {
      return showFieldErrors(general, true);
    }
    for (let n = 0; n < data.impacts.length; n++) {
      for (const st of [0, 1, 2, 3]) {
        const errors = {...impactErrors(data.impacts[n], st),...(n===current?Object.fromEntries(Object.entries(datePending).filter(([key,value])=>value&&(key==='notification'?st===3:st===2)).map(([key])=>[key,'Corrigez et confirmez la date ou l’heure saisie.'])):{})};
        if (Object.keys(errors).length) {
          setCurrent(n); setStep(st);
          setImpactSteps(prev => ({...prev, [n]:st}));
          showFieldErrors(errors);
          return;
        }
      }
    }
    try { const saved = upsertRecord(data, 'published'); setData(saved); localStorage.setItem('traffic-report-draft', JSON.stringify(saved)); }
    catch { setError('La déclaration n’a pas pu être enregistrée sur cet appareil.'); return; }
    setCompleted(Object.fromEntries(data.impacts.map((_, n) => [n, [0,1,2,3,4]])));
    setVerified(true); setFieldErrors({}); setError('');
    notify('Déclaration enregistrée dans le tableau de bord de démonstration. Aucune diffusion voyageurs.');
  }

  function navigate(destination) {
    setScreen(destination);
    const hash = destination === 'form' ? '#declaration' : '#dashboard';
    if (window.location.hash !== hash) window.location.hash = hash;
  }
  function openRecord(record) {
    setGeneralActive(true);
    setData(normalizeWorkflow(withGeneralInformation(structuredClone(record)))); setGeneralVersion(v=>v+1); setPublicationPending(false); setCurrent(0); setStep(0); setImpactSteps({0:0}); setCompleted({});
    setFieldErrors({}); setDatePending({}); setVerified(false); setError('');
    setSaveState('Déclaration chargée depuis cet appareil.'); navigate('form');
  }
  function createRecord() {
    setGeneralActive(true);
    setData(normalizeWorkflow({...initial(),title:'',cause:'',id:makeId(),impacts:[emptyWorkflowImpact()]})); setGeneralVersion(v=>v+1); setPublicationPending(false); setCurrent(0); setStep(0); setImpactSteps({0:0}); setCompleted({});
    setFieldErrors({}); setDatePending({}); setVerified(false); setError('');
    setSaveState('Nouvelle déclaration · modifications non enregistrées.'); navigate('form');
  }
  function handleNavClick(id) {
    setActiveNav(id);
    if (id === 'new') {createRecord();return;}
    if (id === 'dashboard' || id === 'disruptions') { navigate('dashboard'); return; }
    if (id === 'history') {
      setRecord(loadDraft());
      setHistoryOpen(true);
    } else if (id === 'new' || id === 'disruptions') {
      document.querySelector('h1')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const stationOptions = stations.map((label, n) => ({ id: String(n), label }));

  const navSections = [
    {
      id: 'disruptions',
      label: 'Perturbations',
      icon: <Icons icon="alert-triangle" size={20} />,
      items: [
        { id: 'dashboard', label: 'Toutes les perturbations' },
        { id: 'new', label: 'Nouvelle déclaration' },
        { id: 'history', label: 'Mes déclarations' },
      ],
      defaultOpen: true,
    },
  ];

  const sidebarElement = (
    <Sidebar
      product="traffic-report"
      clientName="Île-de-France Mobilités"
      sections={navSections}
      activeId={activeNav}
      onItemClick={handleNavClick}
      scope={{
        options: [{ id: 'idfm', label: 'Île-de-France Mobilités' }],
        value: network,
        onChange: setNetwork,
      }}
      user={{
        name: 'Hector Malot',
      }}
      onLogout={() => notify('Déconnexion simulée (espace de démonstration).')}
    />
  );

  if (screen === 'dashboard') return <Dashboard onCreate={createRecord} onEdit={openRecord} onResume={restored ? () => {const draft=loadDraft();if(draft)openRecord(draft);} : undefined}/>;

  return (
    <AppLayout className="traffic-report-app" sidebar={narrow ? null : sidebarElement} contentLabel="Déclaration de perturbation">
      <div className="declaration-content cadence-scrollbar">
      <PageHeader sticky={!narrow}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { id: 'disruptions', label: 'Perturbations', onClick: () => navigate('dashboard') },
              { id: 'new', label: 'Nouvelle déclaration' },
            ]}
          />
        }
        title={data.publication ? data.title || 'Déclaration de perturbation' : 'Nouvelle perturbation prévue'}
        actions={
          <>
            <GhostButton size="sm" label="Tableau de bord" iconStart="arrow-left" onClick={() => navigate('dashboard')}/>
            {narrow && <GhostButton size="sm" label="Menu" onClick={() => setMobileNavOpen(true)}/>}
            <Badge label="Espace de démonstration"/>
            <Badge label="FR"/>
            <Indicator variant={verified ? 'nominal' : 'draft'} label={verified ? 'Vérifiée' : 'Brouillon'} />
          </>
        }
      />

      <div className="page-wrapper">
        {error && <InlineAlert type="error" title="Enregistrement impossible">{error}</InlineAlert>}
        {/* Informations générales */}
        <div onFocusCapture={()=>setGeneralActive(true)}>
        <PageSection title="Informations générales" surface="card" gap={0} className="general section-preview"
          actions={<Indicator variant={generalComplete ? 'nominal' : 'draft'} label={generalComplete ? 'Remplie' : 'À compléter'} />}>
        <Accordion key={generalVersion} items={[{
          id:'general', defaultOpen: generalVersion > 0 || generalActive,
          title: 'Détails de la perturbation',
          content: <><GeneralInformation data={data} errors={fieldErrors} onChange={change}
            onPublicationPending={setPublicationPending}/>
            <FormActions className="general-actions" justify="end"><PrimaryButton size="sm" label="Suivant" iconEnd="arrow-right" onClick={continueGeneral}/></FormActions></>

        }]} />
        </PageSection>
        </div>

        {/* Tunnel de déclaration d'impacts */}
        <div onFocusCapture={()=>setGeneralActive(false)}>
        <PageSection title="Impacts de la perturbation" surface="card" gap={0} className="impact section-preview">
          <div className="impact-head">
            <div>
              <Dropdown
                variant="button"
                aria-label="Impact sélectionné"
                options={data.impacts.map((_, n) => ({ id: String(n), label: `Impact n° ${n + 1}` }))}
                value={String(current)}
                onChange={(value) => {
                  const next = Number(value);
                  setCurrent(next); setStep(impactSteps[next] ?? 0); setDatePending({});
                  setError(''); setFieldErrors({});
                }}
              />
              <span className="impact-count">
                {data.impacts.length} impact{data.impacts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div>
            <GhostButton size="sm" tone="danger" iconStart="trash" label="Supprimer l’impact" disabled={data.impacts.length === 1} onClick={()=>setImpactToDelete(current)}/>
            <GhostButton
              size="sm"
              label="Ajouter un impact"
              iconStart="plus"
              onClick={() => {
                change({ impacts: [...data.impacts, emptyWorkflowImpact()] });
                setCurrent(data.impacts.length);
                setStep(0);
                setImpactSteps(prev => ({...prev, [data.impacts.length]:0}));
                setCompleted(prev => ({...prev, [data.impacts.length]:[]}));
                notify('Un nouvel impact a été ajouté.');
              }}
            />
            </div>
          </div>

          <div className="form-content">
            <PageSection headingLevel={3} gap={20}
              title={STEP_LABELS[step]}
              description={['Ajoutez les objets du réseau concernés par cet impact.','Précisez les conséquences de la perturbation sur le service.','Choisissez des périodes continues ou des créneaux récurrents.','Choisissez les canaux et préparez leurs messages.','Vérifiez l’ensemble des impacts avant de valider la perturbation.'][step]}>

            {step === 0 && <ImpactObjects impact={i} stations={stations} line={line} errors={fieldErrors} onChange={updateImpact}/>}
            {step === 1 && <div className="field" id="field-severity"><SeverityField value={i.severity} onChange={severity=>updateImpact({severity})}/>{fieldErrors.severity&&<p className="field-error" role="alert">{fieldErrors.severity}</p>}</div>}
            {step === 2 && <ImpactSchedule impact={i} errors={fieldErrors} onChange={updateImpact} onPending={updateDatePending}/>}
            {step === 3 && <ImpactMessages key={current} impact={i} errors={fieldErrors} onChange={updateImpact} onPending={updateDatePending}
              pendingNotification={Boolean(datePending.notification)} onValidation={valid=>setCompleted(prev=>({...prev,[current]:valid?[...new Set([...(prev[current]||[]),3])]:(prev[current]||[]).filter(n=>n!==3)}))}/>}
            {step === 4 && <DisruptionSummary data={data} stations={stations} onEdit={(index,target)=>{setCurrent(index);setStep(target);setImpactSteps(prev=>({...prev,[index]:target}));setFieldErrors({});setDatePending({});}}/>}
            </PageSection>
          </div>
        {/* Schéma de conséquence dynamique avec bus animé & Card de conséquence */}
        {step === 1 && SEVERITY_MAP[i.severity] && <div className="impact-consequences">{diagrams.views.length===0 ? <div className="consequence-wrap"><InlineAlert type="information" title="Conséquence sur les objets sélectionnés">La sévérité « {sev.label} » s’applique à tous les objets de cet impact. Consultez le détail des objets dans le résumé.</InlineAlert></div> : issue(i, 0) ? (
          <div className="consequence-wrap">
            <InlineAlert type="warning" title="Schéma indisponible">
              Sélectionnez un tronçon dont l’arrêt de fin se situe après l’arrêt de début.
            </InlineAlert>
          </div>
        ) : (
          <>
            {diagrams.views.length>1&&<p className="workflow-muted">Un schéma par ligne concernée : la sévérité s’applique au tronçon sélectionné sur chacune de ces lignes.</p>}
            {diagrams.unavailable.length>0&&<p className="workflow-muted">Aperçu indisponible pour : {diagrams.unavailable.join(', ')}. Le détail reste disponible dans le résumé.</p>}
            {diagrams.views.map(view=><LineDiagram key={view.key} title={diagrams.views.length>1?`Conséquence sur ${view.line.name||`la ligne ${view.line.code}`}`:undefined} impact={{...i,from:view.from,to:view.to}} sev={sev} stations={view.stations} line={view.line} tweaks={DIAGRAM_OPTIONS}/>)}

            {/* Carte « Conséquence sur l'objet » */}
            <ConsequenceCard sev={sev} />
          </>
        )}</div>}
          <FormActions className="wizard-actions" justify="between">
            <span>Étape {step+2} sur 6</span>
            <div>
              <GhostButton size="sm" label="Précédent" iconStart="arrow-left" onClick={()=>step===0?openGeneral():go(step-1)}/>
              {step<4&&<PrimaryButton size="sm" label="Suivant" iconEnd="arrow-right" onClick={()=>go(step+1)}/>}
            </div>
          </FormActions>
        </PageSection>
        </div>

        <p className="prototype-note">
          Prototype interactif · données de démonstration · aucune diffusion vers les voyageurs
        </p>
      </div>
      </div>
      <footer className="declaration-footer" aria-label="Actions de la déclaration">
        <ProgressBar className="declaration-progress footer-progress" value={(navigation.current+1)/navigation.steps.length*100} aria-label={`Position dans la déclaration : étape ${navigation.current+1} sur ${navigation.steps.length}`}/>
        <div className="declaration-footer-content">
          <CompactImpactStepper current={navigation.current} impactNumber={current+1} compact={narrow}
            steps={navigation.steps} onStepClick={index=>{
              if(index===0){openGeneral();return;}
              go(index-1);
              if(generalActive)requestAnimationFrame(()=>document.querySelector('.impact-head')?.scrollIntoView({behavior:'smooth',block:'center'}));
            }}/>
          <div className="footer-action-area">
            <span className="footer-save-state" role="status">{saveState}</span>
            <FormActions className="footer-actions" justify="end">
              <PrimaryButton outline size="sm" iconStart="save-01" label={narrow?'Brouillon':'Enregistrer le brouillon'} onClick={save}/>
              <PrimaryButton size="sm" label="Créer la perturbation" iconEnd="check" disabled={!creationReady} onClick={validate}/>
            </FormActions>
          </div>
        </div>
      </footer>

      <Modal isOpen={impactToDelete !== null} onClose={()=>setImpactToDelete(null)} size="small"
        title={`Supprimer l’impact n° ${(impactToDelete ?? 0) + 1} ?`}
        secondaryAction={{label:'Annuler', onClick:()=>setImpactToDelete(null)}}
        primaryAction={{label:'Supprimer', destructive:true, onClick:()=>{
          const next=removeFormImpact({impacts:data.impacts,current,impactSteps,completed},impactToDelete);
          if(next){
            change({impacts:next.impacts}); setCurrent(next.current); setStep(next.step);
            setImpactSteps(next.impactSteps); setCompleted(next.completed); setDatePending({});
            notify('L’impact a été supprimé.');
          }
          setImpactToDelete(null);
        }}}>
        <p>Le périmètre, la sévérité, la période et le message de cet impact seront retirés du formulaire. Les autres impacts seront conservés.</p>
      </Modal>
      <Toaster className="declaration-toaster" />
      <Modal isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Navigation">
        <SummaryList aria-label="Navigation principale" items={[
          {id:'dashboard',title:'Toutes les perturbations'}, {id:'new',title:'Nouvelle déclaration'}, {id:'history',title:'Mes déclarations'}
        ]} onItemClick={item=>{setMobileNavOpen(false);handleNavClick(item.id);}}/>
        <Dropdown label="Réseau" options={[{id:'idfm',label:'Île-de-France Mobilités'}]} value={network} onChange={setNetwork}/>
        <GhostButton label="Se déconnecter" onClick={()=>{setMobileNavOpen(false);notify('Déconnexion simulée (espace de démonstration).');}}/>
      </Modal>

      {/* Modale « Mes déclarations » */}
      <Modal isOpen={historyOpen} onClose={() => {setHistoryOpen(false);setActiveNav('new');}} title="Mes déclarations"
        footer={<GhostButton label="Fermer" onClick={() => {setHistoryOpen(false);setActiveNav('new');}}/>}>
        {record ? <SummaryList aria-label="Mes déclarations enregistrées" density="compact" items={[{
          id:'local-draft',title:record.title,meta:`${record.impacts.length} impact(s) · Enregistré sur cet appareil`,status:'draft',statusLabel:'Brouillon'
        }]}/> : <EmptyState size="inline" title="Aucun brouillon enregistré" description="Les brouillons enregistrés sur cet appareil apparaîtront ici."/>}
      </Modal>
    </AppLayout>
  );
}
