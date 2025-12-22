export function attachBrainGestures(host: HTMLElement) {
  if (!host) return;

  let pointers = new Map<number, { x: number; y: number }>();
  let initialDist = 0;
  let initialMid = { x: 0, y: 0 };
  let startScale = 1;
  let scale = 1;
  let minScale = 0.9;
  let maxScale = 3.0;
  let translate = { x: 0, y: 0 };
  let lastMid: { x: number; y: number } | null = null;
  let hoverZoomEnabled = false;

  function applyTransform() {
    host.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
    host.style.transformOrigin = 'center center';
  }

  function dist(a: any, b: any) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function mid(a: any, b: any) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function onPointerDown(e: PointerEvent) {
    host.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const it = pointers.values();
      const p1 = it.next().value!;
      const p2 = it.next().value!;
      initialDist = dist(p1, p2);
      initialMid = mid(p1, p2);
      lastMid = initialMid;
      startScale = scale;
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2 && lastMid) {
      const it = pointers.values();
      const p1 = it.next().value!;
      const p2 = it.next().value!;
      const curDist = dist(p1, p2);

      let newScale = startScale * (curDist / initialDist);
      newScale = Math.max(minScale, Math.min(maxScale, newScale));

      const curMid = mid(p1, p2);
      translate.x += curMid.x - lastMid.x;
      translate.y += curMid.y - lastMid.y;

      scale = newScale;
      lastMid = curMid;
      applyTransform();
    }
  }

  function onPointerUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) {
      initialDist = 0;
      lastMid = null;
      startScale = scale;
    }
    host.releasePointerCapture?.(e.pointerId);
  }

  function onWheel(e: WheelEvent) {
    if (e.ctrlKey || e.deltaY === 0) return;
    if (!(e.altKey || e.metaKey || hoverZoomEnabled)) return;
    e.preventDefault();

    const delta = -e.deltaY * 0.0015;
    scale = Math.max(minScale, Math.min(maxScale, scale * (1 + delta)));
    applyTransform();
  }

  host.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  host.addEventListener('wheel', onWheel, { passive: false });

  host.addEventListener('mouseenter', () => (hoverZoomEnabled = true));
  host.addEventListener('mouseleave', () => (hoverZoomEnabled = false));

  host.style.touchAction = 'none';
  host.style.willChange = 'transform';
  applyTransform();

  return {
    reset() {
      translate = { x: 0, y: 0 };
      scale = 1;
      applyTransform();
    }
  };
}