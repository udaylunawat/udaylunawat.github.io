export function getPerformanceMode() {
  if (window.performanceMode) return window.performanceMode;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches || false;
  const narrowViewport = window.innerWidth <= 768;
  const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
  const lowConcurrency = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  const saveData = !!navigator.connection?.saveData;
  const adaptive = reducedMotion || saveData || narrowViewport || (coarsePointer && (lowMemory || lowConcurrency));

  window.performanceMode = {
    mode: adaptive ? 'adaptive' : 'full',
    adaptive,
    reducedMotion,
    narrowViewport,
    coarsePointer,
    lowMemory,
    lowConcurrency,
    saveData
  };

  return window.performanceMode;
}

export function scheduleIdle(callback, timeout = 1500) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(callback, Math.min(timeout, 500));
}
