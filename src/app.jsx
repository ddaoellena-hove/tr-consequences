import React, { useState } from 'react';
import { issue } from './validation.mjs';
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
  DatePicker, Checkbox, SegmentedControl, Badge,
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
        return { ...imp, severity };
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

const formatDate = (s) => new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

// The domain model remains product-specific; presentation uses Cadence.
function SeverityField({ value, onChange }) {
  return <Dropdown label="Sévérité" value={value} onChange={onChange}
    options={SEVERITIES.map(s => ({ id: s.id, divider: s.id === 'modifie',
      label: `${s.label} · ${s.passant ? 'passant' : 'non passant'}`,
      icon: <span className="severity-dot" data-severity={s.id} aria-hidden="true" />
    }))} />;
}
function ConsequenceCard({ sev, tweaks }) {
  const tone = tweaks.colorCode === false ? 'information' : sev.variant === 'critical' ? 'error' : sev.variant === 'warning' ? 'warning' : 'information';
  return <div className="consequence-wrap"><InlineAlert type={tone} title="Conséquence sur l’objet">
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
  const [restored] = useState(loadDraft);
  const [data, setData] = useState(() => restored || initial());
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
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
  const [generalVersion, setGeneralVersion] = useState(0);

  const generalComplete = Boolean(data.title.trim() && ['Travaux', 'Incident technique', 'Événement'].includes(data.cause));
  const i = data.impacts[current];
  const sev = SEVERITY_MAP[i.severity] || SEVERITIES[0];


  function change(update) {
    setData((d) => ({ ...d, ...update }));
    setVerified(false);
    setError('');
    setSaveState('Modifications non enregistrées');
  }

  function updateImpact(patch) {
    change({ impacts: data.impacts.map((item, n) => (n === current ? { ...item, ...patch } : item)) });
  }

  function go(n) {
    const err = n > step ? issue(i, step) : '';
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(n);
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
    if (!data.title.trim()) {
      setGeneralVersion(v => v + 1);
      setError('Renseignez un intitulé dans les informations générales.');
      return;
    }
    for (let n = 0; n < data.impacts.length; n++) {
      for (const st of [0, 2, 3]) {
        const err = issue(data.impacts[n], st);
        if (err) {
          setCurrent(n);
          setStep(st);
          setError(`Impact ${n + 1} : ${err}`);
          return;
        }
      }
    }
    setVerified(true);
    setError('');
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
    <AppLayout sidebar={sidebarElement} contentLabel="Déclaration de perturbation">
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { id: 'disruptions', label: 'Perturbations' },
              { id: 'new', label: 'Nouvelle déclaration' },
            ]}
          />
        }
        title="Nouvelle perturbation prévue"
        subtitle="Déclaration de perturbation"
        actions={
          <>
            <Badge label="Espace de démonstration"/>
            <Badge label="FR"/>
            <Indicator variant={verified ? 'nominal' : 'draft'} label={verified ? 'Vérifiée' : 'Brouillon'} />
          </>
        }
      />

      <div className="page-wrapper">
        {/* Informations générales */}
        <Accordion className="general" key={generalVersion} items={[{
          id:'general', defaultOpen: generalVersion > 0,
          title: <span className="general-heading">
            <span>Informations générales</span>
            <Indicator variant={generalComplete ? 'nominal' : 'draft'} label={generalComplete ? 'Remplie' : 'À compléter'} />
          </span>,
          content: <><p className="section-description">Les informations générales sont communes à tous les impacts.</p>
          <div className="general-fields">
            <TextInput
              label="Intitulé de la perturbation"
              value={data.title}
              onChange={(e) => change({ title: e.target.value })}
            />
            <Dropdown
              label="Cause"
              options={['Travaux', 'Incident technique', 'Événement'].map((label) => ({ id: label, label }))}
              value={data.cause}
              onChange={(cause) => change({ cause })}
            />
          </div>
</>
        }]} />

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
                  setCurrent(Number(value));
                  setError('');
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
                notify('Un nouvel impact a été ajouté.');
              }}
            />
          </div>

          <nav className="steps-container" aria-label="Étapes de la déclaration">
            <Stepper
              steps={STEP_LABELS.map((label, n) => ({
                id: String(n),
                label,
                state: n === step ? 'current' : n < step ? 'completed' : 'upcoming',
              }))}
              onStepClick={(n) => go(Number(n))}
            />
          </nav>

          <ProgressBar value={(step + 1) * 20} aria-label="Progression de la déclaration" />

          <div className="form-content">
            <h2>{['Périmètre de l’impact', 'Sévérité de l’impact', 'Période d’application', 'Message voyageurs', 'Récapitulatif de l’impact'][step]}</h2>
            <p className="help">
              {[
                'Sélectionnez les arrêts délimitant le tronçon de la ligne 12.',
                'Précisez les conséquences de la perturbation sur le service.',
                'Définissez la période durant laquelle cet impact s’applique.',
                'Rédigez le message associé à cet impact.',
                'Vérifiez les informations avant de valider votre déclaration.',
              ][step]}
            </p>

            {step === 0 && (
              <div className="fields">
                <Dropdown
                  label="Arrêt de début"
                  options={stationOptions}
                  value={String(i.from)}
                  onChange={(v) => updateImpact({ from: Number(v) })}
                />
                <Dropdown
                  label="Arrêt de fin"
                  options={stationOptions}
                  value={String(i.to)}
                  onChange={(v) => updateImpact({ to: Number(v) })}
                />
              </div>
            )}

            {step === 1 && (
              <div className="field">
                <SeverityField value={i.severity} onChange={(severity) => updateImpact({ severity })} />
              </div>
            )}

            {step === 2 && (
              <div className="fields">
                <DatePicker label="Début" withTime variant="button" value={new Date(i.start)}
                  onChange={date => updateImpact({start: localDateValue(date)})} />
                <DatePicker label="Fin" withTime variant="button" value={new Date(i.end)}
                  onChange={date => updateImpact({end: localDateValue(date)})} />
              </div>
            )}

            {step === 3 && (
              <div className="field">
                <TextArea
                  label="Message"
                  value={i.message}
                  onChange={(e) => updateImpact({ message: e.target.value })}
                />
              </div>
            )}

            {step === 4 && (
              <div className="review">
                <strong>
                  Ligne 12 · {STATIONS[i.from]} → {STATIONS[i.to]}
                </strong>
                <br />
                <span className="severity-summary" data-severity={sev.id}>{sev.label}</span> · Du {formatDate(i.start)} au{' '}
                {formatDate(i.end)}
                <p>{i.message}</p>
              </div>
            )}

            {error && (
              <div className="form-error">
                <InlineAlert type="error" title="Vérifiez les informations">
                  {error}
                </InlineAlert>
              </div>
            )}
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
                  <div className="display-option" key={key}><Checkbox aria-label={label} state={tweaks[key] ? 'checked' : 'unchecked'}
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

        <FormActions className="page-actions" justify="between">
          <span>{saveState}</span>
          <div>
            <PrimaryButton outline size="sm" label="Enregistrer le brouillon" onClick={save} />
            {step === 4 && <PrimaryButton size="sm" label="Valider la déclaration" iconEnd="check" onClick={validate} />}
          </div>
        </FormActions>

        <p className="prototype-note">
          Prototype interactif · données de démonstration · aucune diffusion vers les voyageurs
        </p>
      </div>

      <Toaster />

      {/* Modale « Mes déclarations » */}
      <Modal isOpen={historyOpen} onClose={() => {setHistoryOpen(false);setActiveNav('new');}} title="Mes déclarations"
        footer={<GhostButton label="Fermer" onClick={() => {setHistoryOpen(false);setActiveNav('new');}}/>}>
        {record ? (
          <div className="record">
            <strong>{record.title}</strong>
            <br />
            {record.impacts.length} impact(s) · Brouillon enregistré sur cet appareil
          </div>
        ) : (
          <p>Aucun brouillon enregistré sur cet appareil.</p>
        )}
      </Modal>
    </AppLayout>
  );
}
