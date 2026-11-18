(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* —— Mobile navigation (focus trap, Escape, status) —— */
  const btn = document.getElementById("rf-menu-btn");
  const drawer = document.getElementById("rf-mobile-nav");
  const closeBtn = document.getElementById("rf-mobile-close");
  const scrim = drawer?.querySelector(".mobile-nav__scrim");

  const getFocusable = () =>
    drawer
      ? Array.from(
          drawer.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        )
      : [];

  const openNav = () => {
    if (!drawer || !btn) return;
    drawer.hidden = false;
    drawer.dataset.open = "true";
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };

  const closeNav = () => {
    if (!drawer || !btn) return;
    drawer.dataset.open = "false";
    drawer.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    btn.focus();
  };

  if (btn && drawer) {
    drawer.hidden = drawer.dataset.open !== "true";
    btn.addEventListener("click", openNav);
    closeBtn?.addEventListener("click", closeNav);
    scrim?.addEventListener("click", closeNav);
    drawer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeNav();
        return;
      }
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* —— Glass nav on scroll —— */
  const navShell = document.getElementById("rf-nav-shell");
  const onScrollNav = () => {
    if (!navShell) return;
    navShell.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* —— Shader gradient background (React Bits–inspired) —— */
  const shaderCanvas = document.getElementById("rf-shader");
  if (shaderCanvas && shaderCanvas.getContext) {
    const gl = shaderCanvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (gl) {
      const vsSource = `
        attribute vec2 a_pos;
        void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
      `;
      const fsSource = `
        precision mediump float;
        uniform vec2 u_res;
        uniform float u_time;
        void main(){
          vec2 uv = gl_FragCoord.xy / u_res.xy;
          uv.x *= u_res.x / u_res.y;
          float t = u_time * 0.15;
          vec2 p = uv * 2.5;
          float n = sin(p.x + t) * cos(p.y * 1.3 - t * 0.7)
                  + sin((p.x + p.y) * 0.8 - t)
                  + cos(length(p - vec2(1.2, 0.8)) * 2.0 - t * 1.2);
          n = n * 0.25 + 0.5;
          vec3 navy = vec3(0.082, 0.133, 0.310);
          vec3 deep = vec3(0.0, 0.043, 0.216);
          vec3 silver = vec3(0.690, 0.718, 0.765);
          vec3 crimson = vec3(0.827, 0.184, 0.184);
          vec3 col = mix(deep, navy, smoothstep(0.2, 0.85, n));
          col = mix(col, silver, smoothstep(0.72, 0.95, n) * 0.35);
          col = mix(col, crimson, smoothstep(0.88, 1.0, n) * 0.18);
          float vignette = smoothstep(1.2, 0.2, length(uv - vec2(0.55, 0.45)));
          gl_FragColor = vec4(col, 0.55 * vignette);
        }
      `;
      const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(prog, "u_res");
      const uTime = gl.getUniformLocation(prog, "u_time");
      let raf = 0;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        const w = shaderCanvas.clientWidth;
        const h = shaderCanvas.clientHeight;
        shaderCanvas.width = Math.max(1, Math.floor(w * dpr));
        shaderCanvas.height = Math.max(1, Math.floor(h * dpr));
        gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
        gl.uniform2f(uRes, shaderCanvas.width, shaderCanvas.height);
      };
      resize();
      window.addEventListener("resize", resize);
      const start = performance.now();
      const draw = (now) => {
        gl.uniform1f(uTime, reduceMotion ? 0 : (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!reduceMotion) raf = requestAnimationFrame(draw);
      };
      draw(start);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else if (!reduceMotion) raf = requestAnimationFrame(draw);
      });
    }
  }

  /* —— Anime.js hero + scroll reveals (Motion-like springs) —— */
  const runHero = () => {
    if (typeof anime === "undefined" || reduceMotion) {
      document.querySelectorAll("[data-hero-brand],[data-hero-line],[data-hero-lede],[data-hero-cta]").forEach((el) => {
        el.style.opacity = "1";
      });
      return;
    }
    anime.set(["[data-hero-brand]", "[data-hero-line]", "[data-hero-lede]", "[data-hero-cta]"], {
      opacity: 0,
      translateY: 28,
    });
    anime
      .timeline({ easing: "easeOutExpo" })
      .add({
        targets: "[data-hero-brand]",
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 1100,
      })
      .add(
        {
          targets: "[data-hero-line]",
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 900,
        },
        "-=700"
      )
      .add(
        {
          targets: "[data-hero-lede]",
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 800,
        },
        "-=600"
      )
      .add(
        {
          targets: "[data-hero-cta]",
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 700,
        },
        "-=550"
      );
  };
  runHero();

  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      revealEls.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("is-in");
            if (typeof anime !== "undefined") {
              anime({
                targets: el,
                opacity: [0, 1],
                translateY: [22, 0],
                duration: 780,
                easing: "easeOutCubic",
              });
            }
            io.unobserve(el);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* —— Count-up stats —— */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const animateCount = (el) => {
      const raw = el.getAttribute("data-count") || "0";
      const suffix = el.getAttribute("data-suffix") || "";
      const numeric = Number(String(raw).replace(/[^\d.]/g, ""));
      if (!Number.isFinite(numeric) || reduceMotion || typeof anime === "undefined") {
        el.textContent = raw + suffix;
        return;
      }
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: numeric,
        round: 1,
        duration: 1400,
        easing: "easeOutExpo",
        update: () => {
          el.textContent = obj.val + suffix;
        },
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      counters.forEach(animateCount);
    } else {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            cio.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => cio.observe(el));
    }
  }

  /* —— Designed chart + export (Bklit-inspired) —— */
  const chartSvg = document.getElementById("rf-impact-chart");
  if (chartSvg) {
    const points = [
      { y: 40, label: "Y1" },
      { y: 78, label: "Y2" },
      { y: 126, label: "Y3" },
      { y: 182, label: "Y4" },
      { y: 250, label: "Y5" },
    ];
    const pad = { t: 28, r: 20, b: 40, l: 44 };
    const w = 440;
    const h = 260;
    const maxY = 260;
    const xAt = (i) => pad.l + (i * (w - pad.l - pad.r)) / (points.length - 1);
    const yAt = (v) => pad.t + (1 - v / maxY) * (h - pad.t - pad.b);
    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.y).toFixed(1)}`)
      .join(" ");
    const areaD = `${pathD} L ${xAt(points.length - 1).toFixed(1)} ${(h - pad.b).toFixed(1)} L ${xAt(0).toFixed(1)} ${(h - pad.b).toFixed(1)} Z`;

    const ns = "http://www.w3.org/2000/svg";
    const add = (name, attrs, parent = chartSvg) => {
      const el = document.createElementNS(ns, name);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      parent.appendChild(el);
      return el;
    };

    add("defs", {}).insertAdjacentHTML(
      "beforeend",
      `<linearGradient id="rfChartFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffdad6" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#ffdad6" stop-opacity="0"/>
       </linearGradient>
       <linearGradient id="rfChartStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#b8c4fb"/>
        <stop offset="100%" stop-color="#ffdad6"/>
       </linearGradient>`
    );

    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const yy = pad.t + t * (h - pad.t - pad.b);
      add("line", {
        x1: pad.l,
        x2: w - pad.r,
        y1: yy,
        y2: yy,
        stroke: "rgba(255,255,255,0.08)",
        "stroke-width": "1",
      });
      add("text", {
        x: pad.l - 10,
        y: yy + 4,
        fill: "rgba(255,255,255,0.45)",
        "font-size": "10",
        "text-anchor": "end",
        "font-family": "Plus Jakarta Sans, sans-serif",
      }).textContent = String(Math.round(maxY * (1 - t)));
    });

    const area = add("path", { d: areaD, fill: "url(#rfChartFill)" });
    const line = add("path", {
      d: pathD,
      fill: "none",
      stroke: "url(#rfChartStroke)",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });

    points.forEach((p, i) => {
      add("circle", {
        cx: xAt(i),
        cy: yAt(p.y),
        r: 4.5,
        fill: "#000b37",
        stroke: "#ffdad6",
        "stroke-width": "2",
      });
      add("text", {
        x: xAt(i),
        y: h - 14,
        fill: "rgba(255,255,255,0.55)",
        "font-size": "11",
        "text-anchor": "middle",
        "font-family": "Plus Jakarta Sans, sans-serif",
        "letter-spacing": "0.06em",
      }).textContent = p.label;
    });

    if (!reduceMotion && typeof anime !== "undefined") {
      const len = line.getTotalLength();
      line.style.strokeDasharray = String(len);
      line.style.strokeDashoffset = String(len);
      area.style.opacity = "0";
      anime({
        targets: line,
        strokeDashoffset: [len, 0],
        duration: 1600,
        easing: "easeInOutSine",
        complete: () => {
          anime({ targets: area, opacity: [0, 1], duration: 600, easing: "easeOutQuad" });
        },
      });
    }

    const exportBtn = document.getElementById("rf-export-chart");
    exportBtn?.addEventListener("click", async () => {
      const frame = document.getElementById("rf-chart-frame");
      if (!frame) return;
      exportBtn.disabled = true;
      exportBtn.setAttribute("aria-busy", "true");
      const prev = exportBtn.innerHTML;
      exportBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">progress_activity</span> Exporting…';
      try {
        const clone = chartSvg.cloneNode(true);
        clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const xml = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 880;
        canvas.height = 520;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000b37";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "rayfort-institutional-chart.png";
        a.click();
      } catch (_) {
        exportBtn.textContent = "Export failed — try again";
        setTimeout(() => {
          exportBtn.innerHTML = prev;
          exportBtn.disabled = false;
          exportBtn.removeAttribute("aria-busy");
        }, 1800);
        return;
      }
      exportBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check</span> Saved';
      setTimeout(() => {
        exportBtn.innerHTML = prev;
        exportBtn.disabled = false;
        exportBtn.removeAttribute("aria-busy");
      }, 1600);
    });
  }

  /* —— Interactive cursor (Rive-inspired physics follow) —— */
  const dot = document.querySelector(".rf-cursor");
  const ring = document.querySelector(".rf-cursor-ring");
  if (dot && ring && finePointer && !reduceMotion) {
    const state = { x: 0, y: 0, rx: 0, ry: 0, on: false };
    window.addEventListener(
      "pointermove",
      (e) => {
        state.x = e.clientX;
        state.y = e.clientY;
        if (!state.on) {
          state.on = true;
          state.rx = e.clientX;
          state.ry = e.clientY;
          dot.classList.add("is-on");
          ring.classList.add("is-on");
        }
      },
      { passive: true }
    );
    document.addEventListener("pointerover", (e) => {
      const hot = e.target.closest("a, button, .pillar, .tile, .btn");
      dot.classList.toggle("is-hot", Boolean(hot));
    });
    const tick = () => {
      state.rx += (state.x - state.rx) * 0.18;
      state.ry += (state.y - state.ry) * 0.18;
      dot.style.left = `${state.x}px`;
      dot.style.top = `${state.y}px`;
      ring.style.left = `${state.rx}px`;
      ring.style.top = `${state.ry}px`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* —— Magnetic buttons (Motion physics) —— */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* —— Contact form: blur validation feedback —— */
  const form = document.querySelector('form[action="/contact"]');
  if (form) {
    const fields = form.querySelectorAll("input[required], textarea[required], select[required]");
    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        const ok = field.checkValidity();
        field.setAttribute("aria-invalid", ok ? "false" : "true");
        let err = field.parentElement?.querySelector(".field-error");
        if (!ok) {
          if (!err) {
            err = document.createElement("p");
            err.className = "field-error";
            err.id = `${field.id || field.name}-error`;
            field.setAttribute("aria-describedby", err.id);
            field.parentElement?.appendChild(err);
          }
          err.textContent = field.validationMessage || "Please complete this field.";
        } else if (err) {
          err.remove();
          field.removeAttribute("aria-describedby");
        }
      });
    });
    form.addEventListener("submit", () => {
      const submit = form.querySelector('button[type="submit"]');
      if (!submit) return;
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      const label = submit.textContent;
      submit.dataset.label = label;
      submit.textContent = "Sending…";
    });
  }
})();
