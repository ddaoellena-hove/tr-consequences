// Local prototype metadata. Publication dates do not trigger a server publication.
export const LABEL_OPTIONS = ['Actualités', 'Travaux', 'Confidentiel', 'Équipements'];
const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const newReference = () => `TR-${id()}`;
export function withGeneralInformation(data) {
 return {...data,
  reference:typeof data.reference === 'string' ? data.reference : data.id ? `TR-${data.id}` : newReference(),
  publicationStart:typeof data.publicationStart === 'string' ? data.publicationStart : data.updatedAt || new Date().toISOString(),
  labels:Array.isArray(data.labels) ? [...new Set(data.labels.filter(label=>LABEL_OPTIONS.includes(label)))] : [],
  properties:Array.isArray(data.properties) ? data.properties.filter(p=>p&&typeof p.name==='string'&&typeof p.value==='string').map(p=>({...p,id:typeof p.id==='string'?p.id:id()})) : [],
 };
}
