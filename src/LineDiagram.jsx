import React, { useRef, useEffect } from 'react';
import { LineBadge, Indicator, PageSection } from '@ddaoellena/cadence-ui';


// Géométrie de référence du diagramme
const W = 1136;
const H = 120;
const lineY = 60;
const R = 11;
const LEFT = 64;
const RIGHT = W - 64;
const GAP = (RIGHT - LEFT) / 5;
const STOPS = [0, 1, 2, 3, 4, 5].map((i) => LEFT + GAP * i);
const LANE = 11; // décalage voie aller / retour

// Boucle généralisée de trajectoire entre startX et endX
function buildLoopSeg(startX, endX) {
  const lower = lineY + LANE;
  const upper = lineY - LANE;
  const pts = [];
  const steps = (len) => Math.max(2, Math.round(Math.abs(len) / 4));

  // segment 1 : voie basse, startX → endX (cap droit)
  let n = steps(endX - startX);
  for (let i = 0; i < n; i++) {
    pts.push({ x: startX + (endX - startX) * (i / n), y: lower, dir: 1 });
  }

  // arc 1 : demi-tour à endX
  const na = 16;
  for (let i = 0; i <= na; i++) {
    const a = ((90 - 180 * (i / na)) * Math.PI) / 180;
    pts.push({ x: endX + R * Math.cos(a), y: lineY + R * Math.sin(a), dir: i < na / 2 ? 1 : -1 });
  }

  // segment 2 : voie haute, endX → startX (cap gauche)
  n = steps(endX - startX);
  for (let i = 0; i < n; i++) {
    pts.push({ x: endX - (endX - startX) * (i / n), y: upper, dir: -1 });
  }

  // arc 2 : demi-tour à startX
  for (let i = 0; i <= na; i++) {
    const a = ((270 - 180 * (i / na)) * Math.PI) / 180;
    pts.push({ x: startX + R * Math.cos(a), y: lineY + R * Math.sin(a), dir: i < na / 2 ? -1 : 1 });
  }

  // longueurs cumulées
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const last = pts[pts.length - 1];
  const first = pts[0];
  const total = cum[cum.length - 1] + Math.hypot(last.x - first.x, last.y - first.y);
  return { pts, cum, total };
}

// Panneau Sens Interdit (NoEntry)
function NoEntry({ x, color }) {
  return (
    <g>
      <circle cx={x} cy={lineY} r="11" fill={color} stroke="var(--cadence-color-white)" strokeWidth="2" />
      <rect x={x - 6.5} y={lineY - 2} width="13" height="4" rx="1" fill="var(--cadence-color-white)" />
    </g>
  );
}

// Flèche de demi-tour au-dessus d'un arrêt (flip=true → sens inverse)
function Uturn({ x, color, flip }) {
  const top = lineY - 28;
  const d = flip
    ? `M ${x + 12} ${lineY - 14} L ${x + 12} ${top} A 12 12 0 0 0 ${x - 12} ${top} L ${x - 12} ${lineY - 16}`
    : `M ${x - 12} ${lineY - 14} L ${x - 12} ${top} A 12 12 0 0 1 ${x + 12} ${top} L ${x + 12} ${lineY - 16}`;
  const ax = flip ? x - 12 : x + 12;
  const arrowPath = `M ${ax} ${lineY - 12} l ${flip ? 4 : -4} -5 l ${flip ? -8 : 8} 0 z`;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d={arrowPath} fill={color} />
    </g>
  );
}

// Bus vectoriel détaillé avec roues et vitres
function Bus({ busRef }) {
  return (
    <div
      ref={busRef}
      className="diagram-bus"
    >
      <svg width="46" height="24" viewBox="0 0 46 24" className="diagram-bus-svg">
        <rect x="2" y="3" width="40" height="15" rx="4" fill="var(--cadence-status-active-on-dark)" stroke="var(--cadence-color-primary)" strokeWidth="1.6" />
        <rect x="6" y="6.5" width="6.5" height="6" rx="1.4" fill="var(--cadence-color-white)" />
        <rect x="15" y="6.5" width="6.5" height="6" rx="1.4" fill="var(--cadence-color-white)" />
        <rect x="24" y="6.5" width="6.5" height="6" rx="1.4" fill="var(--cadence-color-white)" />
        <rect x="35.5" y="6.5" width="5" height="6" rx="1.4" fill="var(--cadence-status-warning-bg)" />
        <circle cx="13" cy="19" r="3.4" fill="var(--cadence-color-primary)" />
        <circle cx="32" cy="19" r="3.4" fill="var(--cadence-color-primary)" />
      </svg>
    </div>
  );
}

export function LineDiagram({ impact, sev, stations, line = {code:'12',mode:'bus'}, tweaks = {}, title = 'Schéma de conséquence' }) {
  const bus1Ref = useRef(null);
  const bus2Ref = useRef(null);

  const colorOn = tweaks.colorCode !== false;
  const showLabels = tweaks.labels !== false;
  const passant = sev ? sev.passant : true;

  // Indices dynamiques basés sur l'impact sélectionné (défaut 2 et 3)
  const fromIndex = typeof impact?.from === 'number' && impact.from >= 0 && impact.from < 5 ? impact.from : 2;
  const toIndex = typeof impact?.to === 'number' && impact.to > fromIndex && impact.to <= 5 ? impact.to : 3;

  const stopFrom = STOPS[fromIndex];
  const stopTo = STOPS[toIndex];
  const midX = (stopFrom + stopTo) / 2;
  const accent = sev ? (colorOn ? sev.color : 'var(--cadence-color-primary)') : 'var(--cadence-color-border-strong)';

  useEffect(() => {
    const bus1 = bus1Ref.current;
    const bus2 = bus2Ref.current;
    if (!bus1 || !bus1.animate) return;

    // Bus 1 navigue soit sur la ligne complète (passant), soit de Gare Centre jusqu'à l'arrêt de début (non passant)
    const endX1 = sev && !passant ? stopFrom : STOPS[5];
    const loop1 = buildLoopSeg(LEFT, endX1);
    const tf = (p) => `translate(${p.x - 23}px, ${p.y - 12}px) scaleX(${p.dir})`;

    // Position initiale bus 1
    const position1 = bus1.animate([{transform: tf(loop1.pts[0])}], {duration: 1, fill: 'both'});
    let position2;

    // Position initiale bus 2 (non passant : arrêt de fin jusqu'à Zénith)
    if (bus2 && !passant) {
      const loop2 = buildLoopSeg(stopTo, STOPS[5]);
      position2 = bus2.animate([{transform: tf(loop2.pts[0])}], {duration: 1, fill: 'both'});
    }

    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!sev || tweaks.animate === false || reduced) return () => { position1.cancel(); position2?.cancel(); };

    const speedMap = { lente: 110, normale: 210, rapide: 340 };
    const speed = speedMap[tweaks.speed] || 210;

    // Animation du bus 1
    const frames1 = loop1.pts.map((p, i) => ({
      offset: loop1.cum[i] / loop1.total,
      transform: tf(p),
    }));
    frames1.push({ offset: 1, transform: tf(loop1.pts[0]) });
    const dur1 = Math.round((loop1.total / speed) * 1000);
    const anim1 = bus1.animate(frames1, { duration: dur1, iterations: Infinity, easing: 'linear' });

    // Animation du bus 2 (non passant uniquement)
    let anim2 = null;
    if (bus2 && !passant) {
      const loop2 = buildLoopSeg(stopTo, STOPS[5]);
      const frames2 = loop2.pts.map((p, i) => ({
        offset: loop2.cum[i] / loop2.total,
        transform: tf(p),
      }));
      frames2.push({ offset: 1, transform: tf(loop2.pts[0]) });
      const dur2 = Math.round((loop2.total / speed) * 1000);
      anim2 = bus2.animate(frames2, {
        duration: dur2,
        delay: -Math.round(dur2 / 2),
        iterations: Infinity,
        easing: 'linear',
      });
    }

    return () => {
      position1.cancel();
      position2?.cancel();
      anim1.cancel();
      if (anim2) anim2.cancel();
    };
  }, [sev?.id, tweaks.animate, tweaks.speed, stopFrom, stopTo, passant]);

  return (
    <PageSection surface="none" title={title} headingLevel={3} gap={0} className="diagram-section"
      actions={<div className="diagram-identity"><LineBadge code={line.code} mode={line.mode} color={line.color} size="sm"/><span className="line-name">{line.name||`Ligne ${line.code}`}</span>
        {sev && <Indicator variant={colorOn ? sev.variant : 'draft'} label={sev.tag}/>}</div>}>
    <div className="diagram-content" data-severity={sev?.id} data-color-code={colorOn}>
      {/* Canevas SVG et Bus animés */}
      <div className="diagram-scroll cadence-scrollbar" role="img" aria-label={`Ligne ${line.code} : ${stations.join(', ')}. ${sev?.label || 'État nominal'} entre ${stations[fromIndex]} et ${stations[toIndex]}.`}>
        <div className="diagram-canvas">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="diagram-svg">
            {/* Piste de base (fond) */}
            <line
              x1={STOPS[0]}
              y1={lineY}
              x2={STOPS[5]}
              y2={lineY}
              stroke="var(--cadence-color-border)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Portions desservies */}
            {(!sev || passant) && (
              <line
                x1={STOPS[0]}
                y1={lineY}
                x2={STOPS[5]}
                y2={lineY}
                stroke={sev ? 'var(--cadence-color-primary)' : 'var(--cadence-color-border-strong)'}
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}

            {sev && !passant && (
              <>
                {/* Voie gauche : Gare Centre → arrêt de début */}
                <line
                  x1={STOPS[0]}
                  y1={lineY}
                  x2={stopFrom}
                  y2={lineY}
                  stroke="var(--cadence-color-primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Voie droite : arrêt de fin → Zénith */}
                <line
                  x1={stopTo}
                  y1={lineY}
                  x2={STOPS[5]}
                  y2={lineY}
                  stroke="var(--cadence-color-primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Tronçon impacté (Passant) */}
            {sev && passant && (
              <line
                x1={stopFrom}
                y1={lineY}
                x2={stopTo}
                y2={lineY}
                stroke={accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={sev.id === 'perturbe' || sev.id === 'reduit' ? '3 10' : 'none'}
              />
            )}

            {/* Tronçon impacté (Non passant : pointillés) */}
            {sev && !passant && (
              <line
                x1={stopFrom}
                y1={lineY}
                x2={stopTo}
                y2={lineY}
                stroke={colorOn ? sev.color : 'var(--cadence-color-danger)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="4 9"
                opacity="0.85"
              />
            )}

            {/* Cartouche d'annotation (Passant) */}
            {sev && passant && (
              <g>
                <rect
                  x={midX - 62}
                  y={lineY - 38}
                  width="124"
                  height="22"
                  rx="6"
                  fill={colorOn ? 'var(--tr-impact-subtle)' : 'var(--cadence-color-white)'}
                  stroke={colorOn ? 'var(--tr-impact-border)' : 'var(--cadence-color-border)'}
                />
                <text
                  x={midX}
                  y={lineY - 23}
                  textAnchor="middle"
                  fontFamily="var(--cadence-font-sans)"
                  fontSize="var(--cadence-font-size-caption)"
                  fontWeight="var(--tr-font-weight-medium)"
                  fill={colorOn ? sev.color : 'var(--cadence-color-primary)'}
                  className="diagram-annotation"
                >
                  {sev.label.toLowerCase()}
                </text>
              </g>
            )}

            {/* Demi-tours et panneau Sens Interdit (Non passant) */}
            {sev && !passant && (
              <g>
                <Uturn x={stopFrom} color={colorOn ? sev.color : 'var(--cadence-color-primary)'} />
                <Uturn x={stopTo} color={colorOn ? sev.color : 'var(--cadence-color-primary)'} flip={true} />
                <NoEntry x={midX} color={colorOn ? sev.color : 'var(--cadence-color-danger)'} />
              </g>
            )}

            {/* Arrêts de la ligne */}
            {STOPS.map((x, i) => {
              const barredSeverities = ['bloquante', 'interrompu', 'modifie', 'reduit', 'perturbe'];
              const blocked = sev && i >= fromIndex && i <= toIndex && barredSeverities.includes(sev.id);
              const strikeColor = sev && colorOn ? sev.color : 'var(--cadence-color-danger)';
              const d = 6.5;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={lineY}
                    r="9"
                    fill="var(--cadence-color-white)"
                    stroke={blocked ? strikeColor : 'var(--cadence-color-primary)'}
                    strokeWidth={blocked ? 2.5 : 3}
                  />
                  {blocked && (
                    <g stroke={strikeColor} strokeWidth="2.5" strokeLinecap="round">
                      <line x1={x - d} y1={lineY - d} x2={x + d} y2={lineY + d} />
                      <line x1={x + d} y1={lineY - d} x2={x - d} y2={lineY + d} />
                    </g>
                  )}
                  {showLabels && (
                    <text
                      x={x}
                      y={lineY + 27}
                      textAnchor="middle"
                      fontFamily="var(--cadence-font-sans)"
                      fontSize="var(--cadence-font-size-small)"
                      fontWeight={blocked ? 'var(--tr-font-weight-bold)' : 'var(--tr-font-weight-medium)'}
                      fill={blocked ? strikeColor : 'var(--cadence-color-primary)'}
                      textDecoration={blocked ? 'line-through' : 'none'}
                    >
                      {stations[i]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Bus 1 */}
          <Bus busRef={bus1Ref} />

          {/* Bus 2 (affiché uniquement en cas de non passant) */}
          <div hidden={!(sev && !passant)}>
            <Bus busRef={bus2Ref} />
          </div>
        </div>
      </div>

      {/* Légende du schéma */}
      <div className="diagram-legend">
        <span>
          <i />
          Service maintenu
        </span>
        {sev && (
          <span className="legend-impact" >
            <i />
            {sev.tag} ({sev.label})
          </span>
        )}
      </div>
    </div>
    </PageSection>
  );
}
