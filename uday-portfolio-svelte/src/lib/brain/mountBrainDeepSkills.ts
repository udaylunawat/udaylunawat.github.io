import '$lib/brain/styles/brain.css';
import { ensureThreeDeps } from './three/ensureThreeDeps';
import { BrainVisualization } from './three/BrainVisualization';
import { defaultClusters } from './config/defaultClusters';
// import { MatrixEffect } from '$lib/brain/matrix/matrixEffect';

export async function mountBrainDeepSkills({
  container,
  glbPath = '/brain/brain.glb',
  clusters = [],
  options = {}
}: {
  container?: HTMLElement | null;
  glbPath?: string;
  clusters?: any[];
  options?: any;
} = {}) {
  if (typeof window === 'undefined') return null;

  const host = container ?? document.getElementById('brain-host');
  if (!host) {
    console.warn('[BrainDeepSkills] #brain-host not found');
    return null;
  }

  await ensureThreeDeps();

  // const autoReveal = options.autoReveal !== false;

  // if (autoReveal) {
  //   const matrix = new MatrixEffect(document.body);
  //   matrix.onComplete = () => host.classList.add('brain-visible');
  // } else {
  //   host.classList.add('brain-visible');
  // }

  if (!clusters.length) {
    clusters = defaultClusters;
  }

  return new BrainVisualization(host, glbPath, clusters, options);
}