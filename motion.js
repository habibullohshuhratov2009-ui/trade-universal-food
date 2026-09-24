// Motion layer. Everything here only adds movement: if this file fails, the page is fully visible.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shot = q.get("shot");
  const splash = $(".splash");

  // 1. Splash: once per browser session
  let seen = false;
  try { seen = sessionStorage.getItem("tuf-splash") === "1"; sessionStorage.setItem("tuf-splash", "1"); } catch {}
  if (!splash) {}
  else if (seen || reduce || shot) splash.remove();
  else {
    splash.classList.add("go");
    setTimeout(() => splash.classList.add("out"), 1400);
    setTimeout(() => splash.remove(), 2300);
  }
  if (reduce || shot) return;

  // 2. Hero headline, word by word (starts after the splash)
  const base = seen ? 100 : 1500;
  const line = $(".brandline");
  if (line) {
    line.innerHTML = line.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i};--base:${base}ms">${w}</span>`).join(" ");
  }

  // 3. Reveal on scroll
  if (!("IntersectionObserver" in window)) return;
  const groups = [
    ["h2", "up"], [".sub", "up"], [".segs-p", "up"], [".seg-list li", "up", 0.08],
    [".stats li", "up", 0.12], [".svc", "up", 0.12], [".marquee", "up"],
    [".team-ph", "zoom", 0.1], [".cars-photo", "wipe"], [".car-tile", "left", 0.12],
    [".cert-img", "wipe"], [".req > div", "right", 0.1], [".about-text p", "up", 0.1],
    [".princ li", "zoom", 0.1], [".slogan", "left"], [".c-list li", "up", 0.1], [".call-card", "zoom"]
  ];
  groups.forEach(([sel, type, step]) => {
    $$(sel).forEach((el, i) => {
      if (el.closest(".hero-in")) return;
      el.dataset.anim = type;
      if (step) el.style.setProperty("--d", `${(i % 4) * step}s`);
    });
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  root.classList.add("js-anim");
  $$("[data-anim]").forEach(el => io.observe(el));

  // Safety net: anything on screen that did not get revealed is shown anyway
  const sweep = () => $$("[data-anim]:not(.on)").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add("on");
  });
  setTimeout(sweep, 1800);
  addEventListener("scroll", () => { clearTimeout(sweep.t); sweep.t = setTimeout(sweep, 400); }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(sweep, 300); });

  // 4. Scroll progress bar
  const bar = $(".progress");
  let ticking = false;
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    ticking = false;
  };
  if (bar) { addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true }); upd(); }

  // 5. Logo follows the pointer a little (desktop only)
  const logo = $(".hero-logo");
  if (logo && matchMedia("(hover: hover)").matches) {
    $(".hero").addEventListener("pointermove", e => {
      const x = (e.clientX / innerWidth - 0.5) * 18, y = (e.clientY / innerHeight - 0.5) * 14;
      logo.style.transform = `translate(${x}px, ${y}px)`;
    });
    logo.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
  }
})();
