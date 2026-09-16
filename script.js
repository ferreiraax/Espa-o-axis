/**
 * Espaço Axis — interações da demonstração premium.
 * JavaScript puro, acessível e baseado em melhoria progressiva.
 */

(() => {
  "use strict";

  const WHATSAPP_URL =
    "https://wa.me/5516996039031?text=Ol%C3%A1%21%20Conheci%20o%20Espa%C3%A7o%20Axis%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es";
  const INSTAGRAM_URL = "https://www.instagram.com/espaco.axis/";
  const DESKTOP_BREAKPOINT = 992;

  const specialtyContent = Object.freeze({
    reabilitacao: {
      title: "Reabilitação",
      text: "Um cuidado direcionado à recuperação da mobilidade, da funcionalidade e da segurança nos movimentos, sempre considerando as necessidades e os objetivos de cada pessoa."
    },
    geriatria: {
      title: "Fisioterapia para pessoas idosas",
      text: "Um acompanhamento voltado ao movimento, ao equilíbrio, à autonomia e à realização das atividades do dia a dia, respeitando o ritmo e as condições individuais."
    },
    neuropatias: {
      title: "Cuidados em neuropatias",
      text: "O acompanhamento pode trabalhar aspectos como mobilidade, coordenação, equilíbrio e funcionalidade, de acordo com uma avaliação individual e as necessidades apresentadas."
    },
    "dor-cronica": {
      title: "Cuidado para dor crônica",
      text: "Uma abordagem progressiva que considera as limitações, a rotina e os objetivos da pessoa, buscando desenvolver mais confiança e segurança durante o movimento."
    }
  });

  const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const getFocusableElements = (container) => {
    if (!container) return [];

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    return Array.from(container.querySelectorAll(selector)).filter((element) => {
      const isHidden = element.getAttribute("aria-hidden") === "true";
      const isVisible = element.getClientRects().length > 0;
      return !isHidden && isVisible;
    });
  };

  /** Escreve mensagens breves na região aria-live existente. */
  const createFeedbackAnnouncer = () => {
    const feedbackRegion = document.querySelector("#feedback-region");
    let clearTimer = 0;

    return (message, duration = 1500) => {
      if (!feedbackRegion || !message) return;

      window.clearTimeout(clearTimer);
      feedbackRegion.textContent = "";

      window.requestAnimationFrame(() => {
        feedbackRegion.textContent = message;
        clearTimer = window.setTimeout(() => {
          feedbackRegion.textContent = "";
        }, duration);
      });
    };
  };

  /** Menu móvel com controle de foco, scroll e estados ARIA. */
  const initMobileMenu = (announce) => {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    if (!menuToggle || !menu) return;

    const desktopMedia = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT + 1}px)`);
    let isOpen = false;

    const setMenuState = (open, options = {}) => {
      const { returnFocus = false, notify = true } = options;
      if (isOpen === open && menuToggle.getAttribute("aria-expanded") === String(open)) return;

      isOpen = open;
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("data-open", String(open));
      document.body.classList.toggle("menu-open", open);

      if (open) {
        const firstLink = menu.querySelector("a[href]");
        window.requestAnimationFrame(() => firstLink?.focus({ preventScroll: true }));
      } else if (returnFocus) {
        menuToggle.focus({ preventScroll: true });
      }

      if (notify) announce(open ? "Menu aberto." : "Menu fechado.");
    };

    menuToggle.addEventListener("click", () => setMenuState(!isOpen));

    menu.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => {
        if (isOpen) setMenuState(false, { notify: false });
      });
    });

    menu.addEventListener("click", (event) => {
      if (event.target === menu && isOpen) setMenuState(false);
    });

    document.addEventListener("click", (event) => {
      if (!isOpen || menu.contains(event.target) || menuToggle.contains(event.target)) return;
      setMenuState(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        setMenuState(false, { returnFocus: true });
      }
    });

    const closeOnDesktop = (event) => {
      if (event.matches && isOpen) setMenuState(false, { notify: false });
    };

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", closeOnDesktop);
    } else if (typeof desktopMedia.addListener === "function") {
      desktopMedia.addListener(closeOnDesktop);
    }
  };

  /** Header compacto e botão de retorno atualizados em um único ciclo de scroll. */
  const initScrollStates = () => {
    const header = document.querySelector("[data-scroll-header]");
    const backToTop = document.querySelector("[data-back-to-top]");
    if (!header && !backToTop) return;

    let frameRequested = false;

    const update = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const headerScrolled = scrollPosition > 48;
      const showBackToTop = scrollPosition > Math.max(window.innerHeight * 0.7, 520);

      if (header) {
        header.classList.toggle("is-scrolled", headerScrolled);
        header.setAttribute("data-scrolled", String(headerScrolled));
      }

      if (backToTop) {
        backToTop.classList.toggle("is-visible", showBackToTop);
        backToTop.setAttribute("data-visible", String(showBackToTop));
        backToTop.setAttribute("aria-hidden", String(!showBackToTop));
        backToTop.tabIndex = showBackToTop ? 0 : -1;
      }

      frameRequested = false;
    };

    const requestUpdate = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    backToTop?.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });

      const mainHeading = document.querySelector("#hero-title");
      const focusDelay = prefersReducedMotion() ? 0 : 450;
      if (mainHeading) {
        const hadTabIndex = mainHeading.hasAttribute("tabindex");
        if (!hadTabIndex) mainHeading.setAttribute("tabindex", "-1");

        window.setTimeout(() => {
          mainHeading.focus({ preventScroll: true });
          if (!hadTabIndex) {
            mainHeading.addEventListener("blur", () => mainHeading.removeAttribute("tabindex"), { once: true });
          }
        }, focusDelay);
      }
    });
  };

  /** Rolagem interna com compensação para o header fixo. */
  const initSmoothNavigation = () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    if (!internalLinks.length) return;

    internalLinks.forEach((link) => {
      if (link.matches("[data-back-to-top]")) return;

      link.addEventListener("click", (event) => {
        const rawTarget = link.getAttribute("href");
        if (!rawTarget) return;

        let target;
        try {
          target = document.querySelector(rawTarget);
        } catch {
          return;
        }

        if (!target) return;
        event.preventDefault();

        const header = document.querySelector("#site-header");
        const headerHeight = header?.getBoundingClientRect().height ?? 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: prefersReducedMotion() ? "auto" : "smooth"
        });

        if (window.history?.pushState) {
          window.history.pushState(null, "", rawTarget);
        }

        const focusTarget = target.querySelector("h1, h2") ?? target;
        const hadTabIndex = focusTarget.hasAttribute("tabindex");
        if (!hadTabIndex) focusTarget.setAttribute("tabindex", "-1");

        const focusDelay = prefersReducedMotion() ? 0 : 500;
        window.setTimeout(() => {
          focusTarget.focus({ preventScroll: true });
          if (!hadTabIndex) {
            focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
          }
        }, focusDelay);
      });
    });
  };

  /** Destaca a seção atual no menu principal. */
  const initActiveNavigation = () => {
    const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
    if (!navLinks.length) return;

    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id) return null;

        let section = null;
        try {
          section = document.querySelector(id);
        } catch {
          section = null;
        }
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const setActiveLink = (activeLink) => {
      navLinks.forEach((link) => {
        const active = link === activeLink;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };

    setActiveLink(sections[0].link);

    if (!("IntersectionObserver" in window)) return;

    const visibleSections = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target, entry.intersectionRatio);
          else visibleSections.delete(entry.target);
        });

        const current = sections
          .filter(({ section }) => visibleSections.has(section))
          .sort((a, b) => {
            const ratioDifference = (visibleSections.get(b.section) ?? 0) - (visibleSections.get(a.section) ?? 0);
            if (Math.abs(ratioDifference) > 0.05) return ratioDifference;
            return Math.abs(a.section.getBoundingClientRect().top) - Math.abs(b.section.getBoundingClientRect().top);
          })[0];

        if (current) setActiveLink(current.link);
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 0.15, 0.35, 0.6]
      }
    );

    sections.forEach(({ section }) => observer.observe(section));
  };

  /** Revelação progressiva: sem JavaScript, todo o conteúdo permanece visível. */
  const initScrollReveal = () => {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (!elements.length) return;

    const revealAll = () => elements.forEach((element) => element.classList.add("is-visible"));

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    try {
      const staggerGroups = document.querySelectorAll(
        ".feature-grid, .specialty-grid, .pilates-path, .gallery-grid, .process-list"
      );

      staggerGroups.forEach((group) => {
        Array.from(group.querySelectorAll(":scope > .reveal")).forEach((item, index) => {
          item.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
        });
      });

      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.08
        }
      );

      document.documentElement.classList.add("has-js");
      elements.forEach((element) => observer.observe(element));

      // Proteção adicional: nenhum conteúdo ficará oculto se o observer for interrompido.
      window.setTimeout(() => {
        elements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight * 1.25) element.classList.add("is-visible");
        });
      }, 1200);
    } catch {
      document.documentElement.classList.remove("has-js");
      revealAll();
    }
  };

  /** Accordion nativo, permitindo somente uma resposta aberta por vez. */
  const initFaq = () => {
    const accordion = document.querySelector("[data-accordion]");
    if (!accordion) return;

    const items = Array.from(accordion.querySelectorAll(".accordion-item"));
    if (!items.length) return;

    const updateAccessibility = (item, index) => {
      const summary = item.querySelector("summary");
      const content = item.querySelector(".accordion-content");
      if (!summary || !content) return;

      const contentId = content.id || `faq-answer-${index + 1}`;
      content.id = contentId;
      summary.setAttribute("aria-controls", contentId);
      summary.setAttribute("aria-expanded", String(item.open));
      content.setAttribute("aria-hidden", String(!item.open));
    };

    items.forEach((item, index) => {
      updateAccessibility(item, index);

      item.addEventListener("toggle", () => {
        if (item.open) {
          items.forEach((otherItem, otherIndex) => {
            if (otherItem !== item && otherItem.open) otherItem.open = false;
            updateAccessibility(otherItem, otherIndex);
          });
        }
        updateAccessibility(item, index);
      });
    });

    window.addEventListener(
      "resize",
      () => {
        items.forEach((item, index) => updateAccessibility(item, index));
      },
      { passive: true }
    );
  };

  /** Modal de especialidades com foco preso e retorno ao acionador. */
  const initSpecialtyModal = (announce) => {
    const modal = document.querySelector("#specialty-modal");
    const modalTitle = document.querySelector("#modal-title");
    const modalDescription = document.querySelector("#modal-description");
    const closeButton = modal?.querySelector("[data-modal-close]");
    const openButtons = document.querySelectorAll("[data-modal-open][data-specialty]");

    if (!modal || !modalTitle || !modalDescription || !closeButton || !openButtons.length) return;

    let lastFocusedElement = null;
    let isModalOpen = false;

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    const cleanupModal = () => {
      if (!isModalOpen) return;
      isModalOpen = false;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      const focusTarget = lastFocusedElement;
      lastFocusedElement = null;
      if (focusTarget instanceof HTMLElement && document.contains(focusTarget)) {
        window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
      }
    };

    const closeModal = () => {
      if (!isModalOpen) return;

      if (typeof modal.close === "function" && modal.open) modal.close();
      else modal.removeAttribute("open");

      cleanupModal();
    };

    const openModal = (specialtyKey, trigger) => {
      const content = specialtyContent[specialtyKey];
      if (!content) return;

      lastFocusedElement = trigger instanceof HTMLElement ? trigger : document.activeElement;
      modalTitle.textContent = content.title;

      const paragraph = document.createElement("p");
      paragraph.textContent = content.text;
      modalDescription.replaceChildren(paragraph);

      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      isModalOpen = true;

      if (typeof modal.showModal === "function") {
        if (!modal.open) modal.showModal();
      } else {
        modal.setAttribute("open", "");
      }

      window.requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
      announce("Detalhes da especialidade abertos.");
    };

    openButtons.forEach((button) => {
      button.addEventListener("click", () => openModal(button.dataset.specialty, button));
    });

    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    modal.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal();
    });

    modal.addEventListener("close", cleanupModal);

    modal.addEventListener("keydown", (event) => {
      if (!isModalOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(modal);
      if (!focusableElements.length) {
        event.preventDefault();
        closeButton.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });
  };

  /** Estados leves de carregamento e erro das imagens existentes. */
  const initImageStates = () => {
    const images = document.querySelectorAll("img");
    if (!images.length) return;

    const markLoaded = (image) => {
      image.classList.remove("is-loading", "has-image-error");
      image.classList.add("is-loaded");
      image.dataset.imageState = "loaded";
    };

    const markError = (image) => {
      image.classList.remove("is-loading", "is-loaded");
      image.classList.add("has-image-error");
      image.dataset.imageState = "error";
      image.removeAttribute("aria-busy");
    };

    images.forEach((image) => {
      image.classList.add("is-loading");
      image.dataset.imageState = "loading";
      image.setAttribute("aria-busy", "true");

      if (image.complete) {
        if (image.naturalWidth > 0) markLoaded(image);
        else markError(image);
        image.removeAttribute("aria-busy");
        return;
      }

      image.addEventListener(
        "load",
        () => {
          markLoaded(image);
          image.removeAttribute("aria-busy");
        },
        { once: true }
      );

      image.addEventListener("error", () => markError(image), { once: true });
    });
  };

  /** Confere destinos externos sem interceptar a navegação normal. */
  const initExternalLinks = () => {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
      link.href = WHATSAPP_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    document.querySelectorAll('a[href*="instagram.com/espaco.axis"]').forEach((link) => {
      link.href = INSTAGRAM_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const relValues = new Set((link.rel || "").split(/\s+/).filter(Boolean));
      relValues.add("noopener");
      relValues.add("noreferrer");
      link.rel = Array.from(relValues).join(" ");
    });
  };

  const updateFooterYear = () => {
    const yearElement = document.querySelector("#current-year");
    if (yearElement) yearElement.textContent = String(new Date().getFullYear());
  };

  /** Inicializa cada recurso isoladamente para preservar os demais em caso de falha. */
  const safelyInitialize = (initializer) => {
    try {
      initializer();
    } catch {
      // Falhas locais são ignoradas para que os outros componentes continuem ativos.
    }
  };

  const initializeSite = () => {
    const announce = createFeedbackAnnouncer();

    safelyInitialize(() => initMobileMenu(announce));
    safelyInitialize(initScrollStates);
    safelyInitialize(initSmoothNavigation);
    safelyInitialize(initActiveNavigation);
    safelyInitialize(initScrollReveal);
    safelyInitialize(initFaq);
    safelyInitialize(() => initSpecialtyModal(announce));
    safelyInitialize(initImageStates);
    safelyInitialize(initExternalLinks);
    safelyInitialize(updateFooterYear);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
  } else {
    initializeSite();
  }
})();
