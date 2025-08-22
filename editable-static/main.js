// Minimal hero canvas animation (placeholder). We'll replace with the GitHub shader effect next.
(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  function loop() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // Background gradient that slowly shifts
    const g = ctx.createLinearGradient(0, 0, w, h);
    const hue = (t * 0.04) % 360;
    g.addColorStop(0, `hsl(${(hue + 40) % 360} 60% 8% / 1)`);
    g.addColorStop(1, `hsl(${(hue + 180) % 360} 50% 12% / 1)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Soft blobby circles
    const cx = w * (0.5 + 0.2 * Math.sin(t * 0.0012));
    const cy = h * (0.5 + 0.2 * Math.cos(t * 0.001));
    for (let i = 0; i < 5; i++) {
      const r = Math.max(w, h) * (0.2 + i * 0.08);
      ctx.beginPath();
      ctx.arc(cx + Math.sin(t * 0.0016 + i) * 20, cy + Math.cos(t * 0.0013 + i) * 20, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue + i * 20) % 360} 60% ${18 + i * 4}% / 0.08)`;
      ctx.fill();
    }

    t += 16;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
