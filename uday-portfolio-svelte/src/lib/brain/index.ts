export { attachBrainGestures } from './brainGestures';
export { mountBrainDeepSkills } from './brainDeepSkills';
export async function loadBrain() {
  if (typeof window === 'undefined') return null;
  const mod = await import('./brainDeepSkills');
  return mod;
}