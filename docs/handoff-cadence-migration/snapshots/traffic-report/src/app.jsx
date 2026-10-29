import React, { useState, useEffect, useMemo } from 'react';
import { issue, impactErrors, generalErrors, CAUSES, validDate } from './validation.mjs';
import { LineDiagram } from './LineDiagram.jsx';
import {
  PrimaryButton,
  GhostButton,
  Dropdown,
  TextInput,
  TextArea,
  Stepper,
  InlineAlert,
  Indicator,
  LineBadge,
  Icons,
  Sidebar,
  AppLayout,
  PageHeader,
  Breadcrumbs,
  Accordion, PageSection, FormActions, ProgressBar, Modal, Toaster, toast,
  DatePicker, SegmentedControl, Badge,
  ErrorSummary, DescriptionList, FieldRow, Toggle, EmptyState, SummaryList,
} from '@ddaoellena/cadence-ui';

export const STATIONS = ['Gare Centre', 'République', 'Université', 'Hôpital', 'Stade', 'Zénith'];
export const STEP_LABELS = ['Périmètre', 'Sévérité de l’impact', 'Période', 'Message voyageurs', 'Récapitulatif'];

// Modèle officiel des 6 sévérités issu de la maquette de référence
export const SEVERITIES = [
  {
    id: 'bloquante',
    label: 'Bloquante',
    color: 'var(--tr-severity-bloquante)',
    passant: false,
    tag: 'Tronçon bloquant',
    variant: 'critical',
    badge: 'Tronçon bloquant',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Bloquante ».',
    conseq: 'Il s’agira donc d’un tronçon bloquant : il ne sera pas emprunté lors d’une recherche d’itinéraire, et une solution de contournement sera proposée aux voyageurs.',
  },
  {
    id: 'interrompu',
    label: 'Service interrompu',
    color: 'var(--tr-severity-interrompu)',
    passant: false,
    tag: 'Tronçon non passant',
    variant: 'critical',
    badge: 'Tronçon non passant',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Service interrompu ».',
    conseq: 'Il s’agira donc d’un tronçon non passant : aucune circulation n’est calculée sur ce tronçon pendant la période d’application.',
  },
  {
    id: 'modifie',
    label: 'Service modifié',
    color: 'var(--tr-severity-modifie)',
    passant: true,
    tag: 'Tronçon passant',
    variant: 'warning',
    badge: 'Offre adaptée',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Service modifié ».',
    conseq: 'Il s’agira donc d’un tronçon passant : les circulations sont maintenues mais l’offre est adaptée (parcours ou desserte modifiés).',
  },
  {
    id: 'reduit',
    label: 'Service réduit',
    color: 'var(--tr-severity-reduit)',
    passant: true,
    tag: 'Tronçon passant',
    variant: 'warning',
    badge: 'Offre de transport réduite',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Service réduit ».',
    conseq: 'Il s’agira donc d’un tronçon passant : les circulations sont maintenues mais la fréquence est réduite sur la période d’application.',
  },
  {
    id: 'perturbe',
    label: 'Perturbé / Retards',
    color: 'var(--tr-severity-perturbe)',
    passant: true,
    tag: 'Tronçon passant',
    variant: 'warning',
    badge: 'Circulation perturbée',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Perturbé ».',
    conseq: 'Il s’agira donc d’un tronçon passant : les circulations sont maintenues, des retards sont signalés aux voyageurs sans solution de contournement proposée.',
  },
  {
    id: 'informative',
    label: 'Informative',
    color: 'var(--tr-severity-informative)',
    passant: true,
    tag: 'Tronçon passant',
    variant: 'info',
    badge: 'Information préventive',
    lead: 'Vous avez impacté un tronçon avec une sévérité « Informative ».',
    conseq: 'Il s’agira donc d’un tronçon passant : aucun impact sur le calcul d’itinéraire, seul un message d’information (éventuellement préventif) est diffusé aux voyageurs.',
  },
];

export const SEVERITY_MAP = Object.fromEntries(SEVERITIES.map((s) => [s.id, s]));

const newImpact = () => ({
  severity: 'bloquante',
  from: 2,
  to: 3,
  start: '2026-11-02T06:00',
  end: '2026-11-06T23:00',
  message: 'En raison de travaux de voirie, la ligne 12 est interrompue entre Université et Hôpital. Merci de votre compréhension.',
});

const initial = () => ({
  title: 'Travaux sur la ligne 12',
  cause: 'Travaux',
  impacts: [newImpact()],
});

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
            SEVERITY_MAP[i.severity] &&
            Number.isInteger(i.from) &&
            i.from >= 0 &&
            Number.isInteger(i.to) &&
            i.to <= 5 &&
            i.from < i.to &&
            ['start', 'end', 'message'].every((k) => typeof i[k] === 'string')
        )
      ) {
        return s;
      }
    }
  } catch {}
  return null;
}

const formatDate = s => validDate(s) ? new Date(s).toLocaleString('fr-FR', {dateStyle:'short', timeStyle:'short'}) : 'Non renseigné';
const dateValue = s => validDate(s) ? new Date(s) : null;

// The domain model remains product-specific; presentation uses Cadence.
function SeverityField({ value, onChange }) {
  return <Dropdown label="Sévérité" value={value} onChange={onChange}
    options={SEVERITIES.map(s => ({ id: s.id, divider: s.id === 'modifie',
      label: `${s.label} · ${s.passant ? 'passant' : 'non passant'}`,
      icon: <span className="severity-dot" data-severity={s.id} aria-hidden="true" />
    }))} />;
}
function ConsequenceCard({ sev, tweaks }) {
  return <div className="consequence-wrap"><InlineAlert type="information" title="Conséquence sur l’objet">
    {tweaks.showTag && <Indicator variant={tweaks.colorCode ? sev.variant : 'draft'} label={sev.tag} />}
    <p>{sev.lead} <strong>{sev.conseq}</strong></p>
  </InlineAlert></div>;
}
const localDateValue = date => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const notify = title => toast({type:'information', title});

export default function App() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const [restored] = useState(loadDraft);
  const [data, setData] = useState(() => restored || initial());
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [datePending, setDatePending] = useState({});
  const [summaryVersion, setSummaryVersion] = useState(0);
  const [impactSteps, setImpactSteps] = useState({0: 1});
  const [completed, setCompleted] = useState({0: [0]});
  const [saveState, setSaveState] = useState(
    restored ? 'Brouillon restauré depuis cet appareil.' : 'Vos modifications ne sont pas encore enregistrées.'
  );
  const [record, setRecord] = useState(null);
  const [activeNav, setActiveNav] = useState('new');
  const [network, setNetwork] = useState('idfm');

  // Options d'affichage interactives (Tweaks)
  const [tweaks, setTweaks] = useState({
    colorCode: true,
    showTag: true,
    animate: true,
    speed: 'normale',
    labels: true,
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [generalVersion, setGeneralVersion] = useState(0);

  const generalComplete = Object.keys(generalErrors(data)).length === 0;
  const i = data.impacts[current];
  const sev = SEVERITY_MAP[i.severity] || SEVERITIES[0];
  const startDate = useMemo(() => dateValue(i.start), [i.start]);
  const endDate = useMemo(() => dateValue(i.end), [i.end]);


  function change(update) {
    setData((d) => ({ ...d, ...update }));
    setVerified(false);
    setError('');
    setFieldErrors({});
    setSaveState('Modifications non enregistrées');
  }

  function updateImpact(patch) {
    if ('start' in patch || 'end' in patch) setDatePending(prev => ({...prev, ...('start' in patch ? {start:false} : {}), ...('end' in patch ? {end:false} : {})}));
    change({ impacts: data.impacts.map((item, n) => (n === current ? { ...item, ...patch } : item)) });
    const editedStep = 'from' in patch || 'to' in patch ? 0 : 'severity' in patch ? 1 : 'message' in patch ? 3 : 2;
    setCompleted(prev => ({...prev, [current]: (prev[current] || []).filter(n => n < editedStep)}));
  }

  function showFieldErrors(errors) {
    setFieldErrors(errors);
    setSummaryVersion(v => v + 1);
  }

  function go(n) {
    const errors = n > step ? {...impactErrors(i, step), ...(step === 2 ? Object.fromEntries(Object.entries(datePending).filter(([,pending])=>pending).map(([field])=>[field, 'Corrigez et confirmez la date et l’heure saisies.'])) : {})} : {};
    if (Object.keys(errors).length) return showFieldErrors(errors);
    if (n > step) setCompleted(prev => ({...prev, [current]: [...new Set([...(prev[current] || []), step])]}));
    setError(''); setFieldErrors({}); setDatePending({}); setStep(n);
    setImpactSteps(prev => ({...prev, [current]:n}));
  }

  function save() {
    try {
      localStorage.setItem('traffic-report-draft', JSON.stringify(data));
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
    const general = generalErrors(data);
    if (Object.keys(general).length) {
      setGeneralVersion(v => v + 1);
      return showFieldErrors(general);
    }
    for (let n = 0; n < data.impacts.length; n++) {
      for (const st of [0, 2, 3]) {
        const errors = impactErrors(data.impacts[n], st);
        if (Object.keys(errors).length) {
          setCurrent(n); setStep(st);
          setImpactSteps(prev => ({...prev, [n]:st}));
          showFieldErrors(errors);
          return;
        }
      }
    }
    setCompleted(Object.fromEntries(data.impacts.map((_, n) => [n, [0,1,2,3,4]])));
    setVerified(true); setFieldErrors({}); setError('');
    notify('Déclaration vérifiée dans le prototype. Aucune diffusion effectuée.');
  }

  function handleNavClick(id) {
    setActiveNav(id);
    if (id === 'history') {
      setRecord(loadDraft());
      setHistoryOpen(true);
    } else if (id === 'new' || id === 'disruptions') {
      document.querySelector('h1')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const stationOptions = STATIONS.map((label, n) => ({ id: String(n), label }));

  const navSections = [
    {
      id: 'disruptions',
      label: 'Perturbations',
      icon: <Icons icon="alert-triangle" size={20} />,
      items: [
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

  return (
    <AppLayout className="traffic-report-app" sidebar={narrow ? null : sidebarElement} contentLabel="Déclaration de perturbation">
      <div className="declaration-content cadence-scrollbar">
      <PageHeader sticky={!narrow}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { id: 'disruptions', label: 'Perturbations', onClick: () => handleNavClick('history') },
              { id: 'new', label: 'Nouvelle déclaration' },
            ]}
          />
        }
        title="Nouvelle perturbation prévue"
        subtitle="Déclaration de perturbation"
        actions={
          <>
            {narrow && <GhostButton size="sm" label="Menu" onClick={() => setMobileNavOpen(true)}/>}
            <Badge label="Espace de démonstration"/>
            <Badge label="FR"/>
            <Indicator variant={verified ? 'nominal' : 'draft'} label={verified ? 'Vérifiée' : 'Brouillon'} />
          </>
        }
      />

      <div className="page-wrapper">
        <ErrorSummary key={summaryVersion} errors={Object.entries(fieldErrors).map(([field,message]) => ({id:field, message, target:`field-${field}`}))} />
        {error && <InlineAlert type="error" title="Enregistrement impossible">{error}</InlineAlert>}
        {/* Informations générales */}
        <PageSection title="Informations générales" surface="card" gap={0} className="general"
          actions={<Indicator variant={generalComplete ? 'nominal' : 'draft'} label={generalComplete ? 'Remplie' : 'À compléter'} />}>
        <Accordion key={generalVersion} items={[{
          id:'general', defaultOpen: generalVersion > 0,
          title: 'Intitulé et cause',
          content: <><p className="section-description">Les informations générales sont communes à tous les impacts.</p>
          <div className="general-fields">
            <div id="field-title"><TextInput
              label="Intitulé de la perturbation"
              value={data.title} state={fieldErrors.title ? 'error' : 'enabled'} helperText={fieldErrors.title}
              onChange={(e) => change({ title: e.target.value })}
            /></div>
            <div id="field-cause" role="group" aria-label="Cause" aria-describedby={fieldErrors.cause ? 'error-cause' : undefined}><Dropdown label="Cause"
              options={CAUSES.map(label => ({id:label,label}))} value={data.cause}
              onChange={cause => change({cause})}/>
              {fieldErrors.cause && <p id="error-cause" className="field-error" role="alert">{fieldErrors.cause}</p>}
            </div>
          </div>
</>
        }]} />
        </PageSection>

        {/* Tunnel de déclaration d'impacts */}
        <PageSection title="Impacts de la perturbation" surface="card" gap={0} className="impact">
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
            <PrimaryButton
              outline
              size="sm"
              label="Ajouter un impact"
              iconStart="plus"
              onClick={() => {
                change({ impacts: [...data.impacts, newImpact()] });
                setCurrent(data.impacts.length);
                setStep(0);
                setImpactSteps(prev => ({...prev, [data.impacts.length]:0}));
                setCompleted(prev => ({...prev, [data.impacts.length]:[]}));
                notify('Un nouvel impact a été ajouté.');
              }}
            />
          </div>

          <nav className="steps-container cadence-scrollbar" aria-label="Étapes de la déclaration">
            <Stepper orientation={narrow ? 'vertical' : 'horizontal'}
              steps={STEP_LABELS.map((label, n) => ({
                id: String(n),
                label,
                state: n === step ? 'current' : (completed[current] || []).includes(n) && !issue(i,n) ? 'completed' : 'upcoming',
              }))}
              onStepClick={(n) => go(Number(n))}
            />
          </nav>

          <ProgressBar value={(step + 1) * 20} aria-label="Progression de la déclaration" />

          <div className="form-content">
            <PageSection headingLevel={3} gap={20}
              title={['Périmètre de l’impact','Sévérité de l’impact','Période d’application','Message voyageurs','Récapitulatif de l’impact'][step]}
              description={['Sélectionnez les arrêts délimitant le tronçon de la ligne 12.','Précisez les conséquences de la perturbation sur le service.','Définissez la période durant laquelle cet impact s’applique.','Rédigez le message associé à cet impact.','Vérifiez les informations avant de valider votre déclaration.'][step]}>

            {step === 0 && (
              <FieldRow className="fields">
                <Dropdown
                  label="Arrêt de début"
                  options={stationOptions}
                  value={String(i.from)}
                  onChange={(v) => updateImpact({ from: Number(v) })}
                />
                <div id="field-to" role="group" aria-label="Arrêt de fin" aria-describedby={fieldErrors.to ? 'error-to' : undefined}><Dropdown
                  label="Arrêt de fin"
                  options={stationOptions}
                  value={String(i.to)}
                  onChange={(v) => updateImpact({ to: Number(v) })}
                />{fieldErrors.to && <p id="error-to" className="field-error" role="alert">{fieldErrors.to}</p>}</div>
              </FieldRow>
            )}

            {step === 1 && (
              <div className="field">
                <SeverityField value={i.severity} onChange={(severity) => updateImpact({ severity })} />
              </div>
            )}

            {step === 2 && (
              <FieldRow className="fields">
                <div id="field-start" onChangeCapture={() => setDatePending(prev => ({...prev,start:true}))} role="group" aria-label="Début" aria-describedby={fieldErrors.start ? 'error-start' : undefined}><DatePicker label="Début" withTime value={startDate}
                  onChange={date => updateImpact({start: localDateValue(date)})} />
                  {fieldErrors.start && <p id="error-start" className="field-error" role="alert">{fieldErrors.start}</p>}</div>
                <div id="field-end" onChangeCapture={() => setDatePending(prev => ({...prev,end:true}))} role="group" aria-label="Fin" aria-describedby={fieldErrors.end ? 'error-end' : undefined}><DatePicker label="Fin" withTime value={endDate}
                  onChange={date => updateImpact({end: localDateValue(date)})} />
                  {fieldErrors.end && <p id="error-end" className="field-error" role="alert">{fieldErrors.end}</p>}</div>
              </FieldRow>
            )}

            {step === 3 && (
              <div className="field" id="field-message">
                <TextArea
                  label="Message"
                  value={i.message} state={fieldErrors.message ? 'error' : 'enabled'} helperText={fieldErrors.message}
                  onChange={(e) => updateImpact({ message: e.target.value })}
                />
              </div>
            )}

            {step === 4 && (
              <DescriptionList aria-label="Récapitulatif de l’impact" density="compact" items={[
                {id:'line',label:'Ligne',value:<LineBadge code="12" mode="bus"/>},
                {id:'section',label:'Tronçon',value:`${STATIONS[i.from]} → ${STATIONS[i.to]}`},
                {id:'severity',label:'Sévérité',value:<Indicator variant={sev.variant} label={sev.label}/>},
                {id:'start',label:'Début',value:formatDate(i.start)},
                {id:'end',label:'Fin',value:formatDate(i.end)},
                {id:'message',label:'Message voyageurs',value:i.message},
              ]}/>
            )}
            </PageSection>
          </div>

          <FormActions className="wizard-actions" justify="between">
            <span>Étape {step + 1} sur 5</span>
            <div>
              <GhostButton size="sm" label="Précédent" disabled={step === 0} onClick={() => go(step - 1)} />
              {step < 4 && <PrimaryButton size="sm" label="Suivant" iconEnd="arrow-right" onClick={() => go(step + 1)} />}
            </div>
          </FormActions>
        </PageSection>

        {/* Schéma de conséquence dynamique avec bus animé & Card de conséquence */}
        {issue(i, 0) ? (
          <div className="consequence-wrap">
            <InlineAlert type="warning" title="Schéma indisponible">
              Sélectionnez un tronçon dont l’arrêt de fin se situe après l’arrêt de début.
            </InlineAlert>
          </div>
        ) : (
          <>
            <LineDiagram impact={i} sev={sev} stations={STATIONS} tweaks={tweaks} />

            {/* Options d'affichage interactives (Tweaks) */}
            <PageSection title="Options d’affichage" headingLevel={3} className="tweaks-bar" gap={12}>
              <div className="tweaks-controls">
                {[['colorCode','Code couleur'],['showTag','Tag passant/bloquant'],['animate','Animation bus'],['labels','Arrêts']].map(([key,label]) =>
                  <div className="display-option" key={key}><Toggle aria-label={label} state={tweaks[key] ? 'active' : 'default'}
                    onChange={value => setTweaks(prev => ({...prev,[key]:value}))}/><span>{label}</span></div>)}
                <SegmentedControl aria-label="Vitesse d’animation" size="sm" value={tweaks.speed} disabled={!tweaks.animate}
                  options={[{value:'lente',label:'Lente'},{value:'normale',label:'Normale'},{value:'rapide',label:'Rapide'}]}
                  onChange={speed=>setTweaks(prev=>({...prev,speed}))}/>
              </div>
            </PageSection>

            {/* Carte « Conséquence sur l'objet » */}
            <ConsequenceCard sev={sev} tweaks={tweaks} />
          </>
        )}



        <p className="prototype-note">
          Prototype interactif · données de démonstration · aucune diffusion vers les voyageurs
        </p>
      </div>
      </div>
      <footer className="declaration-footer" aria-label="Actions de la déclaration">
        <FormActions className="page-actions" justify="between">
          <span>{saveState}</span>
          <div>
            <PrimaryButton outline size="sm" label="Enregistrer le brouillon" onClick={save} />
            {step === 4 && <PrimaryButton size="sm" label="Valider la déclaration" iconEnd="check" onClick={validate} />}
          </div>
        </FormActions>
      </footer>

      <Toaster />
      <Modal isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Navigation">
        <SummaryList aria-label="Navigation principale" items={[
          {id:'new',title:'Nouvelle déclaration'}, {id:'history',title:'Mes déclarations'}
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
