# Manifesto Scroll Fill — First Principles Plan

This plan defines the final algorithm and precise code edits to make the manifesto text fill left-to-right when scrolling down, and unfill right-to-left when scrolling up, with no flashing or anchoring artifacts.

Problem summary (current code on disk)
- Up-scroll path is skipped at [if (!goingDown) { lastPos = curPos; return; }](editable-next/app/page.tsx:639) so unfill never happens.
- Fill is forced to be non-decreasing via [let desired = Math.max(prevMax, t)](editable-next/app/page.tsx:651) and [if (smoothed < prevSmooth) smoothed = prevSmooth](editable-next/app/page.tsx:659).
- Easing is only continued for down direction at [if (needsEase && lastDir === 'down')](editable-next/app/page.tsx:685).

Design principles
- Proximity p_i is reversible and independent of direction:
  - p_i = clamp01(1 − |center_i − viewportCenter| / R_i)
  - R_i = max(lineHeight × 0.8, 110)
- Direction detection with hysteresis:
  - lastDir is only updated when |delta| > DIR_EPS
  - This avoids flicker when near a standstill.
- Down-direction finish lock:
  - When goingDown and p_i ≥ 0.96, snap desired to 1 and lock line to stay full while continuing down.
  - When direction flips to up, clear locks so unfill can occur.
- Reversible smoothing:
  - Keep only s_i (smoothed) per line. Do NOT clamp it to be non-decreasing.
  - s_i += (desired − s_i) × k, with k_grow = 0.30, k_shrink = 0.24, k_finish = 0.50 near 1.
- Stable left anchor in CSS:
  - Keep [.manifestoLine](editable-next/app/page.module.css:689) as-is (left-anchored).
  - Only update background-size and overscan in JS. When s_i decreases, wipe recedes from the right edge, giving right-to-left unfill visually.
- Unconditional easing:
  - Continue rAF while easing regardless of direction.

Acceptance criteria
- Scroll down: fill grows left-to-right; near center, the line completes and remains full while direction stays down.
- Scroll up: fill recedes right-to-left smoothly; previously full lines unfill as you move away from center.
- No flashing when direction flips; punctuation fully fills.
- Performance is smooth on desktop and mobile (passive listeners, minimal reads).

Exact code changes (surgical)

1) Add per-line lock map to refs block
- After existing WeakMaps, add:

  [useRef<WeakMap<HTMLElement, boolean>>()](editable-next/app/page.tsx:165)
  
  Insert exactly after existing maps:
  - const lockDownRef = useRef<WeakMap<HTMLElement, boolean>>(new WeakMap());

2) Capture lock map inside the effect
- In [updateManifestoActive() local captures](editable-next/app/page.tsx:628), wire the map:

  [const lockDown = lockDownRef.current](editable-next/app/page.tsx:628)

3) Direction hysteresis and flip detection
- In [direction detection block](editable-next/app/page.tsx:624), persist previous direction and compute flip:

  [const prevDir = lastDir](editable-next/app/page.tsx:624)
  
  Keep goingDown calculation unchanged, then:
  - lastDir = goingDown ? 'down' : 'up';
  - const flippedToUp = (prevDir === 'down' && !goingDown);

4) Remove up-scroll early return
- Delete the branch at [control flow](editable-next/app/page.tsx:639):
  - if (!goingDown) { lastPos = curPos; return; }

5) Replace desired logic with reversible computation and lock behavior
- In the [fill update loop](editable-next/app/page.tsx:644):

  Steps per line g:
  - Compute distance and proximity:
    - d = |center − viewportCenter|
    - radius = max(h × 0.8, 110)
    - t = clamp01(1 − d / radius)
  - Read previous smoothed:
    - prevSmooth = smoothMap.get(g.el) ?? 0
  - If flippedToUp, clear lock:
    - lockDown.delete(g.el)
  - If goingDown:
    - If t ≥ 0.96, desired = 1; lockDown.set(g.el, true)
    - Else if lockDown.get(g.el) === true, desired = 1
    - Else desired = max(prevSmooth, t)
  - If goingUp:
    - desired = min(prevSmooth, t)
  - Reversible smoothing (remove non-decreasing clamp):
    - k = desired === 1 ? 0.50 : (desired > prevSmooth ? 0.30 : 0.24)
    - smoothed = prevSmooth + (desired − prevSmooth) × k
    - Snap extremes:
      - if desired === 1 and smoothed > 0.995, smoothed = 1
      - if desired === 0 and smoothed < 0.005, smoothed = 0
  - Store:
    - smoothMap.set(g.el, smoothed)
    - fillMax.set(g.el, smoothed) // frontier not strictly needed but harmless
  - Set CSS with overscan:
    - pct = '0%' if smoothed ≤ 0, '100%' if smoothed ≥ 1, else (smoothed × 100).toFixed(4) + '%'
    - overscanPx = smoothed > 0 ? 2 : 0
    - g.el.style.setProperty('--fill', pct)
    - g.el.style.backgroundPosition = 'left top, left top'
    - g.el.style.backgroundSize = 'calc(' + pct + ' + ' + overscanPx + 'px) 100%, 100% 100%'
    - g.el.classList.toggle('active', smoothed ≥ 0.98)

6) Unconditional easing rAF
- Replace the rAF scheduling at [needsEase check](editable-next/app/page.tsx:685):
  - From: if (needsEase && lastDir === 'down') { requestAnimationFrame(updateManifestoActive); }
  - To:   if (needsEase) { requestAnimationFrame(updateManifestoActive); }

Temporary debug (optional during development)
- Add a top-of-effect debug flag to log lastDir and sample values for the first line:
  - const DEBUG_MANIFESTO = false;
  - if (DEBUG_MANIFESTO) console.log('dir', lastDir, 'sm', smoothed, 't', t);
- Remove before final commit.

Why this removes flashing
- Anchor never flips; left is constant, so only the amount changes.
- Direction hysteresis avoids rapid dir churn.
- Locking while going down prevents small decreases due to micro jitter near peak.

Why this gives right-to-left unfill on up-scroll
- Left anchoring means decreasing width visually exposes the right side first.
- Because we now allow smoothed to decrease (no monotone clamp, no early returns), the wipe recedes from the right.

Manual verification checklist
- Down from above: lines fill L→R; near center they complete and stay completed while continuing down.
- Flip to up and move away: previously full lines unfill R→L smoothly.
- No flashing at flip points; punctuation at end of lines fills completely (overscan).
- Mobile and desktop both smooth; reduced-motion still readable without animation artifacts.

Performance notes
- Keep listeners passive; continue to minimize DOM reads to one rect per line per update.
- Schedule rAF only while easing; bail when converged.

Rollback
- If needed, revert to current behavior by restoring [639 return](editable-next/app/page.tsx:639), [Math.max(prevMax, t)](editable-next/app/page.tsx:651), the non-decreasing clamp [659](editable-next/app/page.tsx:659), and the directional rAF gate [685](editable-next/app/page.tsx:685).

Next actions
- Apply the code edits exactly as specified above.
- Run through the verification checklist.
- Tune radius and snap constants only if needed after testing.
