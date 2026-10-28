import React, { useState, useRef, useEffect } from 'react';
import { issue } from './validation.mjs';
import { LineDiagram, tint } from './LineDiagram.jsx';
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

export const STATIONS = ['Gare Centre', 'République', 'Université', 'Hôpital', 'Stade', 'Zénith'];
export const STEP_LABELS = ['Périmètre', 'Sévérité de l’impact', 'Période', 'Message voyageurs', 'Récapitulatif'];

// Modèle officiel des 6 sévérités issu de la maquette de référence
export const SEVERITIES = [
  {
    id: 'bloquante',
    label: 'Bloquante',
    color: '#DA1E28',
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
    color: '#A1141B',
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
    color: '#FD4703',
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
    color: '#FD7542',
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
    color: '#FFA144',
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
    color: '#3EAAC5',
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

/* ── Sélecteur de sévérité enrichi (pastille couleur + statut passant/non passant) ── */
function SeverityField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const current = SEVERITY_MAP[value] || SEVERITIES[0];

  return (
    <div className="severity-field-container" ref={ref}>
      <button
        type="button"
        className={`severity-field-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="severity-field-current">
          <span className="severity-dot" style={{ background: current.color }} />
          <span className="severity-label">{current.label}</span>
        </span>
        <span className="severity-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <Icons icon="chevron-down" size={18} />
        </span>
      </button>

      {open && (
        <div className="severity-popover" role="listbox">
          {SEVERITIES.map((s) => {
            const isSel = s.id === current.id;
            return (
              <button
                type="button"
                key={s.id}
                role="option"
                aria-selected={isSel}
                className={`severity-option ${isSel ? 'selected' : ''}`}
                onClick={() => {
                  onChange(s.id);
                  setOpen(false);
                }}
              >
                <span className="severity-dot" style={{ background: s.color }} />
                <span className="severity-option-label">{s.label}</span>
                <span className={`severity-passant-tag ${s.passant ? 'passant' : 'non-passant'}`}>
                  {s.passant ? 'passant' : 'non passant'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Puce de statut passant / non passant ── */
function PassantTag({ sev, colorOn }) {
  const c = colorOn ? sev.color : 'var(--cadence-color-primary, #002830)';
  return (
    <span
      className="passant-tag"
      style={{
        background: colorOn ? tint(sev.color, 14) : 'var(--cadence-color-surface-alt)',
        border: `1px solid ${colorOn ? tint(sev.color, 45) : 'var(--cadence-color-border)'}`,
        color: c,
      }}
    >
      <span className="passant-tag-dot" style={{ background: c }} />
      {sev.tag}
    </span>
  );
}

/* ── Carte explicative « Conséquence sur l'objet » ── */
function ConsequenceCard({ sev, tweaks }) {
  const colorOn = tweaks.colorCode !== false;
  const showTag = tweaks.showTag !== false;
  const accent = colorOn ? sev.color : 'var(--cadence-color-primary, #002830)';

  const idx = sev.conseq.indexOf(' : ');
  const head = idx >= 0 ? sev.conseq.slice(0, idx) : sev.conseq;
  const rest = idx >= 0 ? sev.conseq.slice(idx + 3) : '';

  return (
    <div
      className="consequence-card bubble-in"
      style={{
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        className="consequence-icon-bubble"
        style={{
          background: colorOn ? tint(sev.color, 14) : 'var(--cadence-color-surface-alt)',
        }}
      >
        <Icons icon="annotation-info" size={18} color={accent} />
      </div>
      <div className="consequence-card-body">
        <div className="consequence-card-head">
          <span className="consequence-title" style={{ color: colorOn ? accent : 'var(--cadence-color-text-secondary)' }}>
            Conséquence sur l’objet
          </span>
          {showTag && <PassantTag sev={sev} colorOn={colorOn} />}
        </div>
        <p className="consequence-card-text">
          <span className="consequence-lead">{sev.lead} </span>
          <strong className="consequence-highlight" style={{ color: accent }}>
            {head}
          </strong>
          {rest && <span>{' : ' + rest}</span>}
        </p>
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

  const dialog = useRef(null);
  const general = useRef(null);

  const i = data.impacts[current];
  const sev = SEVERITY_MAP[i.severity] || SEVERITIES[0];

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
      setSaveState(
        'Brouillon enregistré sur cet appareil · ' +
          new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
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

        {/* Informations générales */}
        <details className="general panel" ref={general}>
          <summary>
            <span className="success">
              <Icons icon="check" size={16} />
            </span>
            <div>
              <strong>Informations générales</strong>
              <p>Les informations générales sont communes à tous les impacts.</p>
            </div>
            <span className="chevron">⌄</span>
          </summary>
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
        </details>

        {/* Tunnel de déclaration d'impacts */}
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
              steps={STEP_LABELS.map((label, n) => ({
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  Sévérité
                </label>
                <SeverityField value={i.severity} onChange={(severity) => updateImpact({ severity })} />
              </div>
            )}

            {step === 2 && (
              <div className="fields">
                <TextInput
                  label="Début"
                  type="datetime-local"
                  value={i.start}
                  onChange={(e) => updateImpact({ start: e.target.value })}
                />
                <TextInput
                  label="Fin"
                  type="datetime-local"
                  value={i.end}
                  onChange={(e) => updateImpact({ end: e.target.value })}
                />
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
                <span style={{ color: sev.color, fontWeight: 600 }}>{sev.label}</span> · Du {formatDate(i.start)} au{' '}
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

          <div className="form-actions">
            <span>Étape {step + 1} sur 5</span>
            <div>
              <GhostButton label="Précédent" disabled={step === 0} onClick={() => go(step - 1)} />
              {step < 4 && <PrimaryButton label="Suivant" iconEnd="arrow-right" onClick={() => go(step + 1)} />}
            </div>
          </div>
        </section>

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
            <div className="tweaks-bar">
              <span className="tweaks-title">Options de rendu :</span>
              <div className="tweaks-controls">
                <label className="tweak-toggle">
                  <input
                    type="checkbox"
                    checked={tweaks.colorCode}
                    onChange={(e) => setTweaks((prev) => ({ ...prev, colorCode: e.target.checked }))}
                  />
                  <span>Code couleur</span>
                </label>
                <label className="tweak-toggle">
                  <input
                    type="checkbox"
                    checked={tweaks.showTag}
                    onChange={(e) => setTweaks((prev) => ({ ...prev, showTag: e.target.checked }))}
                  />
                  <span>Tag passant/bloquant</span>
                </label>
                <label className="tweak-toggle">
                  <input
                    type="checkbox"
                    checked={tweaks.animate}
                    onChange={(e) => setTweaks((prev) => ({ ...prev, animate: e.target.checked }))}
                  />
                  <span>Animation bus</span>
                </label>
                <label className="tweak-toggle">
                  <span>Vitesse :</span>
                  <select
                    className="tweak-select"
                    value={tweaks.speed}
                    onChange={(e) => setTweaks((prev) => ({ ...prev, speed: e.target.value }))}
                  >
                    <option value="lente">Lente</option>
                    <option value="normale">Normale</option>
                    <option value="rapide">Rapide</option>
                  </select>
                </label>
                <label className="tweak-toggle">
                  <input
                    type="checkbox"
                    checked={tweaks.labels}
                    onChange={(e) => setTweaks((prev) => ({ ...prev, labels: e.target.checked }))}
                  />
                  <span>Arrêts</span>
                </label>
              </div>
            </div>

            {/* Carte « Conséquence sur l'objet » */}
            <ConsequenceCard sev={sev} tweaks={tweaks} />
          </>
        )}

        <footer>
          <span>{saveState}</span>
          <div>
            <PrimaryButton outline label="Enregistrer le brouillon" onClick={save} />
            {step === 4 && <PrimaryButton label="Valider la déclaration" iconEnd="check" onClick={validate} />}
          </div>
        </footer>

        <p className="prototype-note">
          Prototype interactif · données de démonstration · aucune diffusion vers les voyageurs
        </p>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {/* Modale « Mes déclarations » */}
      <dialog ref={dialog} onClose={() => setActiveNav('new')}>
        <div className="dialog-header">
          <h2>Mes déclarations</h2>
          <GhostButton
            label="Fermer"
            onClick={() => {
              dialog.current?.close();
              setActiveNav('new');
            }}
          />
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
