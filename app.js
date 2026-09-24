(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  const WORKS = window.WORKS || [];
  const TEAM_PHOTOS = window.TEAM_PHOTOS || [];
  const src = id => `assets/work/${id}.jpg`;

  let lang = store.get("tuf-lang") || "uz";

  function t(key) { return (I18N[lang] && I18N[lang][key]) || ""; }
  const L = obj => (obj && (obj[lang] || obj.ru)) || "";

  function renderTeam() {
    $("#teamGrid").innerHTML = TEAM_PHOTOS.map((id, i) => `
      <figure class="team-ph${i === 0 ? " wide" : ""}"><img src="${src(id)}" alt="${t("team_h")}" loading="lazy"></figure>`).join("");
  }

  function renderStrip() {
    $("#strip").innerHTML = WORKS.map((w, i) => `
      <button class="work" data-i="${i}" aria-expanded="false">
        <div class="work-img"><img src="${src(w.img)}" alt="${L(w.t)}" loading="lazy"></div>
        <div class="work-cap"><b>${L(w.t)}</b><small>${L(w.o)} · ${w.year}</small></div>
      </button>`).join("");
    $$("#strip .work").forEach(b => b.addEventListener("click", () => openDetail(+b.dataset.i)));
  }

  let openId = null;
  function openDetail(i) {
    const d = $("#detail");
    $$("#strip .work").forEach(b => b.setAttribute("aria-expanded", String(+b.dataset.i === i && openId !== i)));
    if (openId === i) { d.hidden = true; openId = null; return; }
    const w = WORKS[i];
    openId = i;
    const pics = [w.img, ...w.more];
    d.innerHTML = `
      <div class="detail-media">
        <img class="detail-main" src="${src(pics[0])}" alt="${L(w.t)}">
        ${pics.length > 1 ? `<div class="detail-thumbs">${pics.map((p, k) => `<button class="${k ? "" : "on"}" data-src="${src(p)}"><img src="${src(p)}" alt=""></button>`).join("")}</div>` : ""}
      </div>
      <div>
        <h3 class="detail-title">${L(w.t)}</h3>
        <dl class="detail-dl">
          <div><dt>${t("w_object")}</dt><dd>${L(w.o)}</dd></div>
          <div><dt>${t("w_year")}</dt><dd class="mono">${w.year}</dd></div>
          <div class="wide"><dt>${t("w_desc")}</dt><dd>${L(w.d)}</dd></div>
        </dl>
      </div>`;
    $$(".detail-thumbs button", d).forEach(b => b.addEventListener("click", () => {
      $(".detail-main", d).src = b.dataset.src;
      $$(".detail-thumbs button", d).forEach(x => x.classList.toggle("on", x === b));
    }));
    d.hidden = false;
    d.classList.remove("show"); void d.offsetWidth; d.classList.add("show");
    if (window.innerWidth < 768) d.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function applyLang(l) {
    lang = I18N[l] ? l : "uz";
    store.set("tuf-lang", lang);
    document.documentElement.lang = lang;
    $$("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
    $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    renderTeam(); renderStrip();
    if (openId) { const id = openId; openId = null; openDetail(id); }
  }


  $$("[data-lang]").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  // Strip arrows
  const strip = $("#strip");
  const step = () => Math.min(strip.clientWidth * 0.8, 640);
  $(".strip-nav.prev").addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
  $(".strip-nav.next").addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));

  // Mobile menu
  const burger = $(".burger"), menu = $(".menu");
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".menu a").forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));

  // Page background changes per section + active nav item
  const secs = $$("main .sec");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      document.body.dataset.bg = e.target.dataset.bg;
      $$(".menu a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => io.observe(s));

  // Reveal on enter
  const rio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => rio.observe(el));
  // Safety net: never leave content invisible if the observer does not fire (in-app browsers, background tabs)
  setTimeout(() => $$(".reveal").forEach(el => el.classList.add("in")), 2500);

  const q = new URLSearchParams(location.search);
  if (q.get("lang")) lang = q.get("lang");
  applyLang(lang);

  // Screenshot helpers for the preview (removed before release): ?shot=1&to=work&open=2&hover=3
  if (q.get("shot")) {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.classList.add("no-anim");
    $$(".reveal").forEach(el => el.classList.add("in"));
    if (q.get("open")) openDetail(+q.get("open"));
    if (q.get("menu")) { $(".menu").classList.add("open"); }
    if (q.get("hover")) $$("#strip .work")[+q.get("hover") - 1]?.classList.add("is-hover");
    const to = q.get("to") && document.getElementById(q.get("to"));
    if (to) { to.scrollIntoView(); document.body.dataset.bg = to.dataset.bg; }
  }
})();
