(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  // Placeholder data until Doston sends real photos and captions.
  // Years are approximate, after the registration date 29.10.2018 (owner's instruction 24.09.2026).
  const WORKS = [2019, 2020, 2021, 2021, 2022, 2023, 2024, 2025].map((year, i) => ({ id: i + 1, year }));
  const TEAM = 4;

  let lang = store.get("tuf-lang") || "uz";

  function t(key) { return (I18N[lang] && I18N[lang][key]) || ""; }

  function renderTeam() {
    $("#teamGrid").innerHTML = Array.from({ length: TEAM }, () => `
      <article class="person">
        <div class="ph-img"><i class="ph ph-user"></i><span>${t("ph_photo")}</span></div>
        <b>${t("ph_name")}</b><small>${t("ph_role")}</small>
      </article>`).join("");
  }

  function renderStrip() {
    $("#strip").innerHTML = WORKS.map(w => `
      <button class="work" data-id="${w.id}" aria-expanded="false">
        <div class="ph-img"><i class="ph ph-image"></i><span>${t("ph_photo")}</span></div>
        <div class="work-cap"><b>${t("ph_object")}</b><small>${t("ph_place")} · ${w.year}</small></div>
      </button>`).join("");
    $$("#strip .work").forEach(b => b.addEventListener("click", () => openDetail(+b.dataset.id)));
  }

  let openId = null;
  function openDetail(id) {
    const d = $("#detail");
    $$("#strip .work").forEach(b => b.setAttribute("aria-expanded", String(+b.dataset.id === id && openId !== id)));
    if (openId === id) { d.hidden = true; openId = null; return; }
    const w = WORKS.find(x => x.id === id);
    openId = id;
    d.innerHTML = `
      <div class="detail-img ph-img"><i class="ph ph-image"></i><span>${t("ph_photo")}</span></div>
      <dl class="detail-dl">
        <div><dt>${t("w_object")}</dt><dd>${t("ph_object")}</dd></div>
        <div><dt>${t("w_place")}</dt><dd>${t("ph_place")}</dd></div>
        <div><dt>${t("w_year")}</dt><dd class="mono">${w.year}</dd></div>
        <div class="wide"><dt>${t("w_desc")}</dt><dd>${t("ph_desc")}</dd></div>
      </dl>`;
    d.hidden = false;
    d.classList.remove("show"); void d.offsetWidth; d.classList.add("show");
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

  // Preview-only A/B switch (removed before release)
  function applyVariant(v) {
    document.documentElement.dataset.variant = v;
    $$("[data-v]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    const u = new URL(location.href); u.searchParams.set("v", v); history.replaceState(null, "", u);
  }

  $$("[data-lang]").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  $$("[data-v]").forEach(b => b.addEventListener("click", () => applyVariant(b.dataset.v)));

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
  applyVariant(["a", "b", "c", "d"].includes(q.get("v")) ? q.get("v") : "a");
  if (q.get("lang")) lang = q.get("lang");
  applyLang(lang);

  // Screenshot helpers for the preview (removed before release): ?shot=1&to=work&open=2&hover=3
  if (q.get("shot")) {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.classList.add("no-anim");
    $$(".reveal").forEach(el => el.classList.add("in"));
    if (q.get("open")) openDetail(+q.get("open"));
    if (q.get("hover")) $$("#strip .work")[+q.get("hover") - 1]?.classList.add("is-hover");
    const to = q.get("to") && document.getElementById(q.get("to"));
    if (to) { to.scrollIntoView(); document.body.dataset.bg = to.dataset.bg; }
  }
})();
