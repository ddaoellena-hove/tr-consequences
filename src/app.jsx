import { issue } from './validation.mjs';
import React, { useState, useRef, useEffect } from 'react';
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
} from '@ddaoellena/cadence-ui';

const stations = ['Gare Centre', 'République', 'Université', 'Hôpital', 'Stade', 'Zénith'];
const labels = ['Périmètre', 'Sévérité de l’impact', 'Période', 'Message voyageurs', 'Récapitulatif'];
const severities = {
  interrupted: {
    label: 'Service interrompu',
    badge: 'Tronçon non passant',
    variant: 'critical',
    description: 'Le tronçon est non passant : aucune circulation n’est calculée sur ce tronçon pendant la période d’application.',
    legend: 'Tronçon interrompu',
  },
  reduced: {
    label: 'Service réduit',
    badge: 'Offre de transport réduite',
    variant: 'warning',
    description: 'Le service est réduit : une partie des circulations est maintenue sur le tronçon pendant la période d’application.',
    legend: 'Service réduit',
  },
  delayed: {
    label: 'Retards',
    badge: 'Circulation perturbée',
    variant: 'warning',
    description: 'Des retards sont signalés : les arrêts restent desservis sur le tronçon pendant la période d’application.',
    legend: 'Retards signalés',
  },
};

const newImpact = () => ({
  severity: 'interrupted',
  from: 2,
  to: 3,
  start: '2026-11-02T06:00',
  end: '2026-11-06T23:00',
  message: 'En raison de travaux, la ligne 12 est interrompue entre Université et Hôpital. Merci de votre compréhension.',
});

const initial = () => ({
  title: 'Travaux sur la ligne 12',
  cause: 'Travaux',
  impacts: [newImpact()],
});

function loadDraft() {
  try {
    const s = JSON.parse(localStorage.getItem('traffic-report-draft'));
    if (
      typeof s?.title === 'string' &&
      typeof s?.cause === 'string' &&
      s?.impacts?.length &&
      s.impacts.every(
        (i) =>
          severities[i.severity] &&
          Number.isInteger(i.from) &&
          i.from >= 0 &&
          Number.isInteger(i.to) &&
          i.to < 6 &&
          i.from < i.to &&
          ['start', 'end', 'message'].every((k) => typeof i[k] === 'string')
      )
    )
      return s;
  } catch {}
  return null;
}

const formatDate = (s) => new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

function Diagram({ impact }) {
  const s = severities[impact.severity],
    interrupted = impact.severity === 'interrupted',
    color = `var(--cadence-status-${s.variant}-fg)`,
    x = (n) => 70 + n * 180;
  return (
    <div className="diagram-panel">
      <div className="diagram-header">
        <div>
          <span className="eyebrow">Schéma de conséquence</span>
          <LineBadge code="12" mode="bus" size="sm" />
          <span className="line-name">Ligne 12</span>
        </div>
        <Indicator variant={s.variant} label={s.badge} />
      </div>
      <div
        className="diagram-scroll"
        role="img"
        aria-label={`Ligne 12, de Gare Centre à Zénith. ${s.label} entre ${stations[impact.from]} et ${stations[impact.to]}.`}
      >
        <svg viewBox="0 0 1040 140" aria-hidden="true">
          <path d="M70 70H970" stroke="var(--cadence-color-primary)" strokeWidth="5" />
          <path d={`M${x(impact.from)} 70H${x(impact.to)}`} stroke="var(--cadence-color-surface-alt)" strokeWidth="7" />
          <path d={`M${x(impact.from)} 70H${x(impact.to)}`} stroke={color} strokeWidth="5" strokeDasharray="5 7" strokeLinecap="round" />
          {stations.map((name, n) => {
            const affected = n >= impact.from && n <= impact.to;
            return (
              <g key={name}>
                <circle cx={x(n)} cy="70" r="8" fill="var(--cadence-color-white)" stroke={affected ? color : 'var(--cadence-color-primary)'} strokeWidth="2.5" />
                {affected && interrupted && <path d={`M${x(n) - 4} 66l8 8m-8 0l8-8`} stroke={color} strokeWidth="2" />}
                <text
                  x={x(n)}
                  y="98"
                  textAnchor="middle"
                  fill={affected ? color : 'var(--cadence-color-primary)'}
                  fontSize="12"
                  textDecoration={affected && interrupted ? 'line-through' : undefined}
                >
                  {name}
                </text>
              </g>
            );
          })}
          {interrupted && (
            <g>
              <circle cx={(x(impact.from) + x(impact.to)) / 2} cy="70" r="12" fill={color} stroke="var(--cadence-color-white)" strokeWidth="3" />
              <path d={`M${(x(impact.from) + x(impact.to)) / 2 - 6} 70h12`} stroke="var(--cadence-color-white)" strokeWidth="3" />
            </g>
          )}
          <g transform="translate(145 43)">
            <rect width="34" height="18" rx="4" fill="var(--cadence-color-primary)" />
            <path d="M5 5h5v6H5zm9 0h5v6h-5zm9 0h6v6h-6" fill="var(--cadence-color-white)" />
            <circle cx="8" cy="19" r="3" />
            <circle cx="27" cy="19" r="3" />
          </g>
        </svg>
      </div>
      <div className="diagram-legend">
        <span><i />Service maintenu</span>
        <span className="legend-impact" style={{ '--impact-color': color }}><i />{s.legend}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [restored] = useState(loadDraft);
  const [data, setData] = useState(() => restored || initial());
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [saveState, setSaveState] = useState(restored ? 'Brouillon restauré depuis cet appareil.' : 'Vos modifications ne sont pas encore enregistrées.');
  const [record, setRecord] = useState(null);
  const [activeNav, setActiveNav] = useState('new');
  const [network, setNetwork] = useState('idfm');

  const dialog = useRef(null);
  const general = useRef(null);

  const i = data.impacts[current];
  const s = severities[i.severity];

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

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
      setSaveState('Brouillon enregistré sur cet appareil · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setToast('Brouillon enregistré sur cet appareil.');
    } catch {
      setError('Le stockage local n’est pas disponible.');
    }
  }

  function validate() {
    if (!data.title.trim()) {
      general.current.open = true;
      setError('Renseignez un intitulé dans les informations générales.');
      return;
    }
    for (let n = 0; n < data.impacts.length; n++)
      for (const st of [0, 2, 3]) {
        const err = issue(data.impacts[n], st);
        if (err) {
          setCurrent(n);
          setStep(st);
          setError(`Impact ${n + 1} : ${err}`);
          return;
        }
      }
    setVerified(true);
    setError('');
    setToast('Déclaration vérifiée dans le prototype. Aucune diffusion effectuée.');
  }

  function handleNavClick(id) {
    setActiveNav(id);
    if (id === 'history') {
      setRecord(loadDraft());
      dialog.current?.showModal();
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
      onLogout={() => setToast('Déconnexion simulée (espace de démonstration).')}
    />
  );

  return (
    <AppLayout sidebar={sidebarElement} contentLabel="Déclaration de perturbation">
      <div className="page-wrapper">
        <div className="content-top-bar">
          <div className="breadcrumb">
            Perturbations <span>/</span> Nouvelle déclaration
          </div>
          <div className="top-bar-meta">
            <span className="environment-badge">Espace de démonstration</span>
            <span className="locale-badge">FR</span>
          </div>
        </div>

        <div className="page-title">
          <div>
            <div className="eyebrow">Déclaration de perturbation</div>
            <h1>Nouvelle perturbation prévue</h1>
          </div>
          <Indicator variant={verified ? 'nominal' : 'draft'} label={verified ? 'Vérifiée' : 'Brouillon'} />
        </div>

        <details className="general panel" ref={general}>
          <summary>
            <span className="success"><Icons icon="check" size={16} /></span>
            <div>
              <strong>Informations générales</strong>
              <p>Les informations générales sont communes à tous les impacts.</p>
            </div>
            <span className="chevron">⌄</span>
          </summary>
          <div className="general-fields">
            <TextInput label="Intitulé de la perturbation" value={data.title} onChange={(e) => change({ title: e.target.value })} />
            <Dropdown
              label="Cause"
              options={['Travaux', 'Incident technique', 'Événement'].map((label) => ({ id: label, label }))}
              value={data.cause}
              onChange={(cause) => change({ cause })}
            />
          </div>
        </details>

        <section className="panel impact">
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
                setToast('Un nouvel impact a été ajouté.');
              }}
            />
          </div>

          <nav className="steps-container" aria-label="Étapes de la déclaration">
            <Stepper
              steps={labels.map((label, n) => ({
                id: String(n),
                label,
                state: n === step ? 'current' : n < step ? 'completed' : 'upcoming',
              }))}
              onStepClick={(n) => go(Number(n))}
            />
          </nav>

          <div className="progress" style={{ '--progress-pct': `${(step + 1) * 20}%` }}>
            <div />
          </div>

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
                <Dropdown label="Arrêt de début" options={stationOptions} value={String(i.from)} onChange={(v) => updateImpact({ from: Number(v) })} />
                <Dropdown label="Arrêt de fin" options={stationOptions} value={String(i.to)} onChange={(v) => updateImpact({ to: Number(v) })} />
              </div>
            )}

            {step === 1 && (
              <div className="field">
                <Dropdown
                  label="Sévérité"
                  options={Object.entries(severities).map(([id, v]) => ({ id, label: v.label }))}
                  value={i.severity}
                  onChange={(severity) => updateImpact({ severity })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="fields">
                <TextInput label="Début" type="datetime-local" value={i.start} onChange={(e) => updateImpact({ start: e.target.value })} />
                <TextInput label="Fin" type="datetime-local" value={i.end} onChange={(e) => updateImpact({ end: e.target.value })} />
              </div>
            )}

            {step === 3 && (
              <div className="field">
                <TextArea label="Message" value={i.message} onChange={(e) => updateImpact({ message: e.target.value })} />
              </div>
            )}

            {step === 4 && (
              <div className="review">
                <strong>Ligne 12 · {stations[i.from]} → {stations[i.to]}</strong>
                <br />
                {s.label} · Du {formatDate(i.start)} au {formatDate(i.end)}
                <p>{i.message}</p>
              </div>
            )}

            {error && (
              <div className="form-error">
                <InlineAlert type="error" title="Vérifiez les informations">{error}</InlineAlert>
              </div>
            )}
          </div>

          <div className="form-actions">
            <span>Étape {step + 1} sur 5</span>
            <div>
              <GhostButton label="Précédent" disabled={step === 0} onClick={() => go(step - 1)} />
              {step < 4 && <PrimaryButton label="Suivant" iconEnd="arrow-right" onClick={() => go(step + 1)} />}
            </div>
          </div>
        </section>

        {issue(i, 0) ? (
          <div className="consequence-wrap">
            <InlineAlert type="warning" title="Schéma indisponible">
              Sélectionnez un tronçon dont l’arrêt de fin se situe après l’arrêt de début.
            </InlineAlert>
          </div>
        ) : (
          <>
            <Diagram impact={i} />
            <div className="consequence-wrap">
              <InlineAlert type={i.severity === 'interrupted' ? 'error' : 'warning'} title={`Conséquence sur l’objet · ${s.badge}`}>
                Vous avez impacté un tronçon avec la sévérité « {s.label} ». {s.description}
              </InlineAlert>
            </div>
          </>
        )}

        <footer>
          <span>{saveState}</span>
          <div>
            <PrimaryButton outline label="Enregistrer le brouillon" onClick={save} />
            {step === 4 && <PrimaryButton label="Valider la déclaration" iconEnd="check" onClick={validate} />}
          </div>
        </footer>

        <p className="prototype-note">Prototype interactif · données de démonstration · aucune diffusion vers les voyageurs</p>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      <dialog ref={dialog} onClose={() => setActiveNav('new')}>
        <div className="dialog-header">
          <h2>Mes déclarations</h2>
          <GhostButton label="Fermer" onClick={() => { dialog.current?.close(); setActiveNav('new'); }} />
        </div>
        {record ? (
          <div className="record">
            <strong>{record.title}</strong>
            <br />
            {record.impacts.length} impact(s) · Brouillon enregistré sur cet appareil
          </div>
        ) : (
          <p>Aucun brouillon enregistré sur cet appareil.</p>
        )}
      </dialog>
    </AppLayout>
  );
}
