export const CAUSES = ['Travaux', 'Incident technique', 'Événement'];
export const validDate = value => typeof value === 'string' && value.trim() !== '' && Number.isFinite(Date.parse(value));
export function generalErrors(data) {
  return {
    ...(!data.title.trim() ? { title: 'Renseignez un intitulé pour la perturbation.' } : {}),
    ...(!CAUSES.includes(data.cause) ? { cause: 'Sélectionnez une cause.' } : {}),
  };
}
export function impactErrors(impact, step) {
  if (step === 0 && (!Number.isInteger(impact.from) || !Number.isInteger(impact.to) || impact.from < 0 || impact.to > 5 || impact.from >= impact.to))
    return { to: 'L’arrêt de fin doit se situer après l’arrêt de début.' };
  if (step === 2) {
    const errors = {};
    if (!validDate(impact.start)) errors.start = 'Renseignez une date et une heure de début valides.';
    if (!validDate(impact.end)) errors.end = 'Renseignez une date et une heure de fin valides.';
    if (!Object.keys(errors).length && Date.parse(impact.start) >= Date.parse(impact.end)) errors.end = 'La fin doit se situer après le début de la période.';
    return errors;
  }
  if (step === 3 && !impact.message.trim()) return { message: 'Ajoutez un message pour les voyageurs.' };
  return {};
}
export const issue = (impact, step) => Object.values(impactErrors(impact, step))[0] || '';
