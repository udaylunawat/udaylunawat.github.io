/* brain-gestures.js
   Lightweight two-finger pinch-to-zoom + pan for #brain-host.
   - One-finger drags are left alone (pass-through) so Three.js can handle rotate/drag.
   - Two-finger gestures control CSS transform on the host (scale + translate).
   - Constrains scale between minScale and maxScale to avoid zooming out until invisible.
*/

(function(){
  const host = document.getElementById('brain-host');
  if(!host) return; // nothing to do

  // State
  let pointers = new Map(); // id -> {x,y}
  let initialDist = 0;
  let initialMid = {x:0,y:0};
  let startScale = 1;
  let scale = 1;
  let minScale = 0.9; // don't let user zoom out beyond this
  let maxScale = 3.0;
  let translate = {x:0,y:0};
  let lastMid = null;
  // Hover state: allow wheel zoom when mouse is over host (desktop)
  let hoverZoomEnabled = false;

  // Apply transform
  function applyTransform(){
    // Use translate in px and scale
    host.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
    host.style.transformOrigin = 'center center';
  }

  // Distance helper
  function dist(a,b){
    const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy);
  }

  // Midpoint
  function mid(a,b){
    return { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };
  }

  // Pointer handlers
  function onPointerDown(e){
    host.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(pointers.size===2){
      const it = pointers.values();
      const p1 = it.next().value; const p2 = it.next().value;
      initialDist = dist(p1,p2);
      initialMid = mid(p1,p2);
      lastMid = initialMid;
      startScale = scale;
    }
  }

  function onPointerMove(e){
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});

    if(pointers.size>=2){
      // pinch/zoom + pan handling
      const it = pointers.values();
      const p1 = it.next().value; const p2 = it.next().value;
      const curDist = dist(p1,p2);
      if(initialDist>0){
        let newScale = startScale * (curDist/initialDist);
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        // Compute midpoint movement -> pan delta
        const curMid = mid(p1,p2);
        const dx = curMid.x - lastMid.x;
        const dy = curMid.y - lastMid.y;

        // Update state
        scale = newScale;
        // When scaling, we want pan to be relative to the scaled coordinates. Keep it simple: accumulate raw dx/dy
        translate.x += dx;
        translate.y += dy;

        lastMid = curMid;
        applyTransform();
      }
    }
  }

  function onPointerUp(e){
    pointers.delete(e.pointerId);
    if(pointers.size<2){
      initialDist = 0;
      lastMid = null;
      startScale = scale;
    }
    host.releasePointerCapture?.(e.pointerId);
  }

  function onWheel(e){
    // If Ctrl is pressed or trackpad pinch/zoom (deltaMode 0) — allow browser/system zoom
    if (e.ctrlKey || e.deltaY === 0) return; // don't interfere with ctrl-zoom or non-wheel
    // Allow zoom when Alt/Meta held (legacy behavior) OR when the pointer is hovering the host
    // This enables desktop users to hover the brain area and use wheel to zoom without modifiers.
    if (!(e.altKey || e.metaKey || hoverZoomEnabled)) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    const prev = scale;
    scale = Math.max(minScale, Math.min(maxScale, scale * (1+delta)));
    // small zoom focal point correction could be added later
    applyTransform();
  }

  // Reset transform helper (optional)
  function reset(){ translate={x:0,y:0}; scale=1; applyTransform(); }

  // Attach listeners
  host.addEventListener('pointerdown', onPointerDown, {passive:false});
  window.addEventListener('pointermove', onPointerMove, {passive:false});
  window.addEventListener('pointerup', onPointerUp, {passive:false});
  window.addEventListener('pointercancel', onPointerUp, {passive:false});
  // wheel for desktop zoom (requires Alt or Meta to engage)
  host.addEventListener('wheel', onWheel, {passive:false});
  // Enable quick hover-based zoom: set a flag when mouse enters/leaves the brain host
  host.addEventListener('mouseenter', ()=>{ hoverZoomEnabled = true; });
  host.addEventListener('mouseleave', ()=>{ hoverZoomEnabled = false; });

  // Initialize style
  host.style.transition = 'transform 0s';
  host.style.willChange = 'transform';
  host.style.touchAction = 'none';
  applyTransform();

  // Expose debug on the host element
  host.brainGestures = { reset, setScale(s){ scale=Math.max(minScale, Math.min(maxScale,s)); applyTransform(); } };
})();
