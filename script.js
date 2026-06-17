(() => {
const root = document.documentElement;

if (window.__ahrorPortfolioInitialized) {
  document.body.classList.remove("is-loading");
  document.querySelector("[data-preloader]")?.remove();
  return;
}

window.__ahrorPortfolioInitialized = true;

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const backToTop = document.querySelector("[data-back-to-top]");
const revealItems = document.querySelectorAll(".reveal");
const projectCards = document.querySelectorAll(".project-card");
let preloader = document.querySelector("[data-preloader]");
const progressFill = document.querySelector("[data-progress-fill]");
const progressText = document.querySelector("[data-progress-text]");
let preloaderStarted = false;
let preloaderFinished = false;
let preloaderFrame = 0;
let preloaderFadeTimer = 0;
let preloaderRemoveTimer = 0;

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  root.dataset.theme = savedTheme;
}

const runPreloader = () => {
  if (preloaderStarted || preloaderFinished || root.dataset.preloaderStatus === "done") {
    document.body.classList.remove("is-loading");
    preloader?.remove();
    preloader = null;
    return;
  }

  preloaderStarted = true;
  root.dataset.preloaderStatus = "running";

  if (!preloader || !progressFill || !progressText) {
    preloaderFinished = true;
    root.dataset.preloaderStatus = "done";
    document.body.classList.remove("is-loading");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 350 : 1700;
  const startTime = performance.now();

  const finish = () => {
    if (preloaderFinished) {
      return;
    }

    preloaderFinished = true;
    root.dataset.preloaderStatus = "done";
    cancelAnimationFrame(preloaderFrame);
    clearTimeout(preloaderFadeTimer);
    clearTimeout(preloaderRemoveTimer);

    progressFill.style.width = "100%";
    progressText.textContent = "100%";

    preloaderFadeTimer = window.setTimeout(() => {
      if (preloader) {
        preloader.classList.add("is-hidden");
      }
    }, reduceMotion ? 120 : 420);

    preloaderRemoveTimer = window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      if (preloader) {
        preloader.remove();
        preloader = null;
      }
    }, reduceMotion ? 260 : 1050);
  };

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.min(Math.round(eased * 100), 100);

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;

    if (progress < 1) {
      preloaderFrame = requestAnimationFrame(tick);
    } else {
      finish();
    }
  };

  preloaderFrame = requestAnimationFrame(tick);
};

if (document.readyState === "complete") {
  runPreloader();
} else {
  window.addEventListener("load", runPreloader, { once: true });
}

const updateThemeLabel = () => {
  if (!themeToggle) {
    return;
  }

  const isDark = root.dataset.theme === "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeToggle.setAttribute("aria-pressed", String(isDark));
};

updateThemeLabel();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    updateThemeLabel();
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
    menuToggle.classList.toggle("is-active");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.classList.remove("is-active");
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const updateScrollState = () => {
  const isScrolled = window.scrollY > 18;
  header?.classList.toggle("is-scrolled", isScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 640);
};

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

projectCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
})();
