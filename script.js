const nav = document.getElementById("nav");
const toggle = document.querySelector(".nav-toggle");
const header = document.querySelector(".nav-bar");
const year = document.getElementById("year");
const progress = document.getElementById("scroll-progress");
const modal = document.getElementById("start-modal");
const form = document.getElementById("start-form");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) year.textContent = String(new Date().getFullYear());

const TAG_ICONS = {
  React: "atom",
  TypeScript: "file-code",
  "Next.js": "hexagon",
  Vite: "zap",
  "Tailwind CSS": "wind",
  Tailwind: "wind",
  Flutter: "smartphone",
  Dart: "triangle",
  Electron: "app-window",
  PWA: "download",
  "Node.js": "server",
  Express: "network",
  Python: "code-2",
  FastAPI: "rocket",
  OpenCV: "scan-eye",
  PostgreSQL: "database",
  Supabase: "database-zap",
  Firebase: "flame",
  Prisma: "boxes",
  WhatsApp: "message-circle",
  Capacitor: "battery-charging",
  RLS: "shield",
  Provider: "git-branch",
  JavaScript: "file-json",
  "RTL / Arabic UX": "languages",
  "أدوار وصلاحيات": "users",
  "Git / GitHub": "git-branch",
  "نشر (Vercel / Hostinger)": "cloud",
  n8n: "workflow",
  Webhooks: "unplug",
};

function decorateTags() {
  document.querySelectorAll(".tags li").forEach((item) => {
    if (item.querySelector("i, svg")) return;
    const name = item.textContent.trim();
    const icon = TAG_ICONS[name] || "code";
    item.innerHTML = `<i data-lucide="${icon}"></i><span>${name}</span>`;
  });
}

function paintIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({
      attrs: { "stroke-width": 1.75 },
    });
  }
}

decorateTags();
paintIcons();

function closeNav() {
  nav?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
}

toggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.width = `${ratio * 100}%`;
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const reveals = document.querySelectorAll(".reveal");
reveals.forEach((el) => el.style.setProperty("--delay", el.dataset.delay || "0"));

function revealAllIn(root) {
  (root || document).querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

function runCounters(scope) {
  (scope || document).querySelectorAll("[data-count]").forEach((el) => {
    if (el.dataset.counted === "1") return;
    el.dataset.counted = "1";
    const target = Number(el.dataset.count);
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

if (reduceMotion) {
  revealAllIn(document);
  runCounters(document);
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        runCounters(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );
  reveals.forEach((el) => observer.observe(el));
} else {
  revealAllIn(document);
  runCounters(document);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.hasAttribute("data-open-start")) return;
  link.addEventListener("click", () => {
    const id = link.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      revealAllIn(target);
      runCounters(target);
    }
  });
});

const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".grid .card");

const search = document.getElementById("project-search");
const projectCount = document.getElementById("project-count");
const projectEmpty = document.getElementById("project-empty");
let selectedFilter = "all";
function normalizeSearch(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0300-\u036f]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").trim();
}
function filterProjects() {
  const query = normalizeSearch(search?.value || "");
  let visible = 0;
  cards.forEach((card) => {
    const categories = (card.dataset.cat || "").split(/\s+/);
    const show = (selectedFilter === "all" || categories.includes(selectedFilter)) && normalizeSearch(card.textContent || "").includes(query);
    card.hidden = !show;
    card.classList.toggle("is-off", !show);
    if (show) { visible += 1; card.classList.add("is-in"); }
  });
  if (projectCount) projectCount.textContent = `عرض ${visible} من ${cards.length} مشروعًا`;
  if (projectEmpty) projectEmpty.hidden = visible > 0;
  onScroll();
}
filters.forEach((btn) => {
  btn.setAttribute("aria-pressed", btn.classList.contains("is-on") ? "true" : "false");
  btn.addEventListener("click", () => {
    selectedFilter = btn.dataset.filter || "all";
    filters.forEach((item) => {
      item.classList.toggle("is-on", item === btn);
      item.setAttribute("aria-pressed", String(item === btn));
    });
    filterProjects();
  });
});
search?.addEventListener("input", filterProjects);
if (cards.length) filterProjects();
let modalTrigger = null;

function openStart(event) {
  event?.preventDefault();
  if (!modal) return;
  modalTrigger = event?.currentTarget || document.activeElement;
  closeNav();
  modal?.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  paintIcons();
  modal?.querySelector("input")?.focus();
}

function closeStart() {
  if (!modal || modal.hidden) return;
  modal?.setAttribute("hidden", "");
  document.body.style.overflow = "";
  modalTrigger?.focus();
}

document.querySelectorAll("[data-open-start]").forEach((el) => {
  el.addEventListener("click", openStart);
});

document.querySelectorAll("[data-close-start]").forEach((el) => {
  el.addEventListener("click", closeStart);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
    closeStart();
  }
  if (event.key === "Tab" && modal && !modal.hidden) {
    const focusable = modal.querySelectorAll("button, input, select, textarea, a[href]");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const type = String(data.get("type") || "").trim();
  const budget = String(data.get("budget") || "").trim();
  const idea = String(data.get("idea") || "").trim();
  const text = [
    `السلام عليكم، أنا ${name}`,
    `البريد: ${email}`,
    `نوع المشروع: ${type}`,
    `الميزانية التقريبية: ${budget}`,
    "",
    "وصف المشكلة:",
    idea,
  ].join("\n");
  window.open(`https://wa.me/966543641209?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  closeStart();
  form.reset();
});
