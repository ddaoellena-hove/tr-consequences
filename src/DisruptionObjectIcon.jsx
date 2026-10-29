import React from 'react';
import {disruptionIconPaths} from './disruption-icon-paths.mjs';

// Preserve the legacy stop scope for deviations; stopPoint and stopArea are distinct.
const TYPES = {line:'Line', stop:'Deviation', section:'Line Section',railSection:'Line Section', access:'Entrance exit', poi:'POI', stopArea:'Stop area', network:'Network', course:'Course', stopPoint:'Stop'};

export function DisruptionObjectIcon({scope}) {
 const paths = disruptionIconPaths[TYPES[scope] || 'Line Section'];
 return <svg className="disruption-object-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths.map((path,index)=><path key={index} {...path}/>)}</svg>;
}
