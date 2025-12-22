export { attachBrainGestures } from './brainGestures';
export { mountBrainDeepSkills } from './mountBrainDeepSkills';
export async function loadBrain() {
  if (typeof window === 'undefined') return null;
  const mod = await import('./mountBrainDeepSkills');
  return mod;
}