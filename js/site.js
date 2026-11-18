(() => {
  const PAGE = document.body?.dataset?.page || "";

  function markActiveNav() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const target = link.getAttribute("data-nav");
      if (target && target === PAGE) {
        link.setAttribute("aria-current", "page");
        link.classList.add("text-primary", "font-semibold", "border-b-2", "border-primary-container");
        link.classList.remove("text-on-surface-variant", "font-label-md", "text-label-md");
      }
    });
  }

  function ensureToastRegion() {
    let region = document.getElementById("rf-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "rf-toast-region";
      region.className = "rf-toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-relevant", "additions");
      document.body.appendChild(region);
    }
    return region;
  }

  function showToast({ title, body, type = "success", duration = 4500 }) {
    const region = ensureToastRegion();
    const toast = document.createElement("div");
    toast.className = "rf-toast";
    toast.dataset.type = type;
    toast.innerHTML = `
      <div>
        <p class="rf-toast__title">${title}</p>
        <p class="rf-toast__body">${body}</p>
      </div>
      <button type="button" class="rf-toast__close" aria-label="Dismiss notification">
        <span class="material-symbols-outlined text-base">close</span>
      </button>
    `;
    const close = () => toast.remove();
    toast.querySelector(".rf-toast__close")?.addEventListener("click", close);
    region.appendChild(toast);
    if (duration > 0) setTimeout(close, duration);
  }

  function wireMobileNav() {
    const btn = document.getElementById("rf-menu-btn");
    const drawer = document.getElementById("rf-mobile-nav");
    const closeBtn = document.getElementById("rf-mobile-close");
    const scrim = drawer?.querySelector(".rf-mobile-nav__scrim");
    if (!btn || !drawer) return;

    const open = () => {
      drawer.dataset.open = "true";
      btn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      closeBtn?.focus();
    };
    const close = () => {
      drawer.dataset.open = "false";
      btn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      btn.focus();
    };

    btn.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);
    scrim?.addEventListener("click", close);
    drawer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function wireForms() {
    document.querySelectorAll("form[data-rf-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const successSelector = form.dataset.success;
        const successEl = successSelector ? document.querySelector(successSelector) : null;
        if (successEl) {
          form.classList.add("hidden");
          successEl.dataset.visible = "true";
          successEl.classList.remove("hidden");
          successEl.style.display = "flex";
        }

        showToast({
          title: form.dataset.toastTitle || "Request received",
          body:
            form.dataset.toastBody ||
            "An executive concierge officer will respond within two business hours.",
        });

        if (!successEl) form.reset();
      });
    });

    document.querySelectorAll("[data-rf-subscribe]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.parentElement?.querySelector('input[type="email"]');
        const email = input?.value?.trim();
        if (!email || !input.checkValidity()) {
          input?.reportValidity();
          showToast({
            title: "Email required",
            body: "Enter a valid executive email to subscribe.",
            type: "error",
          });
          return;
        }
        showToast({
          title: "Subscribed",
          body: "You will receive seasonal leather releases and leadership briefings.",
        });
        input.value = "";
      });
    });
  }

  markActiveNav();
  wireMobileNav();
  wireForms();

  window.Rayfort = { showToast };
})();
