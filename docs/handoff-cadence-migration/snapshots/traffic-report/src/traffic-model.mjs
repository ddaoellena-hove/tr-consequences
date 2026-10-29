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

export const newImpact = () => ({
  severity: 'bloquante',
  from: 2,
  to: 3,
  start: '2026-11-02T06:00',
  end: '2026-11-06T23:00',
  message: 'En raison de travaux de voirie, la ligne 12 est interrompue entre Université et Hôpital. Merci de votre compréhension.',
});

export const initial = () => ({
  title: 'Travaux sur la ligne 12',
  cause: 'Travaux',
  impacts: [newImpact()],
});

