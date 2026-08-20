/* =========================================================
   ROBSON NOBRE — PORTFOLIO
   Cinematic behaviours · vanilla JS, no dependencies
   ========================================================= */
(() => {
    'use strict';

    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse  = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    /* ---------------------------------------------------------
       Film grain texture (kept in JS so the CSS stays readable)
       --------------------------------------------------------- */
    const noise =
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E" +
        "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E" +
        "%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")";
    document.documentElement.style.setProperty('--noise', noise);

    /* ---------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------- */
    const revealIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            revealIO.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    $$('[data-reveal], [data-mask], [data-path]').forEach((el) => revealIO.observe(el));

    /* ---------------------------------------------------------
       Nav — condense on scroll, highlight the current section
       --------------------------------------------------------- */
    const nav = $('#nav');
    const navLinks = $$('#navLinks a[href^="#"]');
    const sections = navLinks
        .map((a) => $(a.getAttribute('href')))
        .filter(Boolean);

    const onNavScroll = () => nav.classList.toggle('stuck', window.scrollY > 40);
    onNavScroll();

    const spyIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const id = '#' + e.target.id;
            navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spyIO.observe(s));

    /* mobile menu */
    const burger = $('#burger');
    const menu = $('#navLinks');
    const closeMenu = () => {
        menu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    /* ---------------------------------------------------------
       Scramble type — cycles the hero role
       --------------------------------------------------------- */
    const CHARS = '!<>-_\\/[]{}—=+*^?#________';

    class Scramble {
        constructor(el) {
            this.el = el;
            this.words = (el.dataset.words || el.textContent).split('|');
            this.i = 0;
            this.frame = 0;
            this.queue = [];
            this.update = this.update.bind(this);
        }
        to(text) {
            const from = this.el.textContent;
            const len = Math.max(from.length, text.length);
            const done = new Promise((res) => (this.resolve = res));
            this.queue = [];
            for (let i = 0; i < len; i++) {
                const start = Math.floor(Math.random() * 32);
                const end = start + Math.floor(Math.random() * 32);
                this.queue.push({ from: from[i] || '', to: text[i] || '', start, end });
            }
            cancelAnimationFrame(this.raf);
            this.frame = 0;
            this.update();
            return done;
        }
        update() {
            let out = '';
            let complete = 0;
            for (const q of this.queue) {
                if (this.frame >= q.end) {
                    complete++;
                    out += q.to;
                } else if (this.frame >= q.start) {
                    if (!q.char || Math.random() < 0.28) {
                        q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                    }
                    out += '<i style="opacity:.55;color:var(--v1);font-style:normal">' + q.char + '</i>';
                } else {
                    out += q.from;
                }
            }
            this.el.innerHTML = out;
            if (complete === this.queue.length) { this.resolve(); return; }
            this.frame++;
            this.raf = requestAnimationFrame(this.update);
        }
        start() {
            const next = () => {
                this.to(this.words[this.i]).then(() => {
                    this.i = (this.i + 1) % this.words.length;
                    this.timer = setTimeout(next, 2400);
                });
            };
            next();
        }
    }

    $$('[data-scramble]').forEach((el) => {
        if (reduced) { el.textContent = (el.dataset.words || '').split('|')[0] || el.textContent; return; }
        new Scramble(el).start();
    });

    /* ---------------------------------------------------------
       Counters
       --------------------------------------------------------- */
    const countIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target;
            countIO.unobserve(el);
            const target = parseInt(el.dataset.count, 10) || 0;
            const sup = el.querySelector('sup');
            const suffix = sup ? sup.outerHTML : '';

            if (reduced) { el.innerHTML = target + suffix; return; }

            const dur = 1500;
            const t0 = performance.now();
            const tick = (now) => {
                const p = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.innerHTML = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((el) => countIO.observe(el));

    /* ---------------------------------------------------------
       Kinetic marquee — base drift, boosted by scroll velocity
       --------------------------------------------------------- */
    const track = $('#marquee');
    let marqueeTick = null;

    if (track && !reduced) {
        const set = track.firstElementChild;
        // duplicate until the track is at least twice the viewport, so the loop never gaps
        while (track.scrollWidth < window.innerWidth * 2) {
            track.appendChild(set.cloneNode(true));
        }
        const unit = set.getBoundingClientRect().width;
        let offset = 0;
        let boost = 0;

        marqueeTick = (delta) => { boost = Math.min(Math.abs(delta) * 0.35, 14); };

        const loop = () => {
            offset -= 0.55 + boost;
            boost *= 0.92;
            if (offset <= -unit) offset += unit;
            track.style.transform = `translate3d(${offset}px,0,0)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    /* ---------------------------------------------------------
       Sticky work stack — cards recede as the next one covers them
       --------------------------------------------------------- */
    const works = $$('#workStack .work');
    const stackable = () => window.matchMedia('(min-width: 1025px)').matches;

    const paintStack = () => {
        if (!works.length) return;
        if (!stackable()) {
            works.forEach((w) => { w.style.transform = ''; });
            return;
        }
        works.forEach((card, i) => {
            const next = works[i + 1];
            if (!next) { card.style.transform = ''; return; }
            const r = next.getBoundingClientRect();
            const cardTop = card.getBoundingClientRect().top;
            // how far the next card has travelled over this one (0 → 1)
            const span = window.innerHeight * 0.75;
            const p = Math.min(Math.max((span - (r.top - cardTop)) / span, 0), 1);
            card.style.transform = `scale(${1 - p * 0.05}) translateY(${p * -14}px)`;
        });
    };

    /* ---------------------------------------------------------
       Timeline rail fill
       --------------------------------------------------------- */
    const pathRoot = $('#pathRoot');
    const pathFill = $('#pathFill');

    const paintRail = () => {
        if (!pathRoot || !pathFill) return;
        const r = pathRoot.getBoundingClientRect();
        const mid = window.innerHeight * 0.62;
        const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
        pathFill.style.setProperty('--fill', (p * 100).toFixed(2) + '%');
    };

    /* ---------------------------------------------------------
       Single scroll loop
       --------------------------------------------------------- */
    let lastY = window.scrollY;
    let queued = false;

    const onScroll = () => {
        const y = window.scrollY;
        if (marqueeTick) marqueeTick(y - lastY);
        lastY = y;
        onNavScroll();
        paintStack();
        paintRail();
        queued = false;
    };

    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(onScroll);
    }, { passive: true });

    window.addEventListener('resize', () => { paintStack(); paintRail(); }, { passive: true });
    paintStack();
    paintRail();

    /* ---------------------------------------------------------
       Spotlight border on project cards
       --------------------------------------------------------- */
    if (!coarse) {
        $$('[data-spot]').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            }, { passive: true });
        });
    }

    /* ---------------------------------------------------------
       Screenshot slideshows — only while on screen
       --------------------------------------------------------- */
    $$('[data-shot]').forEach((shot) => {
        const imgs = $$('img', shot);
        const dots = $$('.shot-dots b', shot);
        if (imgs.length < 2) return;

        let i = 0;
        let timer = null;
        const step = () => {
            i = (i + 1) % imgs.length;
            imgs.forEach((im, n) => im.classList.toggle('on', n === i));
            dots.forEach((d, n) => d.classList.toggle('on', n === i));
        };
        const interval = parseInt(shot.dataset.interval, 10) || 3800;

        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !reduced) {
                if (!timer) timer = setInterval(step, interval);
            } else if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }, { threshold: 0.35 });
        io.observe(shot);
    });

    /* ---------------------------------------------------------
       Portrait tilt
       --------------------------------------------------------- */
    if (!coarse && !reduced) {
        $$('[data-tilt]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
            }, { passive: true });
            el.addEventListener('pointerleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1)';
                setTimeout(() => (el.style.transition = ''), 700);
            });
        });
    }

    /* ---------------------------------------------------------
       Custom cursor
       --------------------------------------------------------- */
    const cursor = $('#cursor');
    if (cursor && !coarse) {
        let cx = -100, cy = -100, tx = -100, ty = -100;
        window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
        const ride = () => {
            cx += (tx - cx) * 0.18;
            cy += (ty - cy) * 0.18;
            cursor.style.transform = `translate3d(${cx - 13}px, ${cy - 13}px, 0)`;
            requestAnimationFrame(ride);
        };
        requestAnimationFrame(ride);

        $$('a, button, [data-hot]').forEach((el) => {
            el.addEventListener('pointerenter', () => cursor.classList.add('hot'));
            el.addEventListener('pointerleave', () => cursor.classList.remove('hot'));
        });
    }

    /* ---------------------------------------------------------
       Particle burst on the main CTA
       --------------------------------------------------------- */
    $$('[data-burst]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            if (reduced) return;
            const host = btn.parentElement;
            const r = btn.getBoundingClientRect();
            const hr = host.getBoundingClientRect();
            const ox = e.clientX - hr.left;
            const oy = e.clientY - hr.top;
            const colors = ['#7c5cff', '#b06cff', '#22d3ee', '#f2f2f7'];

            for (let i = 0; i < 22; i++) {
                const p = document.createElement('span');
                p.className = 'spark';
                p.style.left = ox + 'px';
                p.style.top = oy + 'px';
                p.style.background = colors[i % colors.length];
                host.appendChild(p);

                const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
                const dist = 40 + Math.random() * 70;
                p.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    {
                        transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`,
                        opacity: 0
                    }
                ], { duration: 620 + Math.random() * 260, easing: 'cubic-bezier(0.22,1,0.36,1)' })
                 .onfinish = () => p.remove();
            }
            void r;
        });
    });

    /* ---------------------------------------------------------
       Year in the footer stays honest
       --------------------------------------------------------- */
    const yearEl = $$('.foot-inner span').find((s) => /©/.test(s.textContent));
    if (yearEl) yearEl.textContent = '© ' + new Date().getFullYear();

})();

/* =========================================================
   Camadas cinematográficas — vídeo no hero e retrato vivo.
   Fora do IIFE principal de propósito: se algo aqui falhar,
   o resto do site não sente.
   ========================================================= */
(() => {
    'use strict';
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const con = navigator.connection || {};
    // Quem pediu economia de dados ou está em rede lenta fica com as
    // imagens — que já estão na tela e são ótimas.
    if (reduzido || con.saveData || /(^|-)2g/.test(con.effectiveType || '')) return;

    const fazVideo = (src, cls) => {
        const v = document.createElement('video');
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.autoplay = true;
        v.preload = 'metadata';
        v.setAttribute('aria-hidden', 'true');
        if (cls) v.className = cls;
        v.src = src;
        return v;
    };

    /* ---- fundo do hero: o truque do Frame 0 ----
       (segredo #4 do nobre-site-craft)
       O poster de 12KB — o primeiro frame exato do vídeo — pinta a tela
       imediatamente. O vídeo só entra quando o navegador está OCIOSO, e
       o fade acontece sobre um frame idêntico: o visitante nunca vê a
       troca, e o PageSpeed nunca vê o vídeo no caminho crítico. */
    const hero = document.querySelector('.hero');
    if (hero) {
        const capa = document.createElement('div');
        capa.className = 'hero-cine';
        capa.setAttribute('aria-hidden', 'true');
        const palco = document.createElement('div');
        palco.className = 'cine-move';
        const poster = new Image();
        poster.className = 'cine-poster';
        poster.alt = '';
        poster.src = 'assets/media/hero-frame0.webp';
        poster.addEventListener('load', () => capa.classList.add('on'), { once: true });
        palco.appendChild(poster);
        capa.appendChild(palco);
        hero.prepend(capa);

        const ocioso = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
        ocioso(() => {
            // hero-cine-LOOP: o clipe original + ele mesmo ao contrario,
            // emendados (ping-pong). O corte seco do loop deixa de existir —
            // a deriva vai e volta sem costura. A 0.5x, o ciclo dura 20s.
            // Nome novo de arquivo = nunca briga com cache do antigo.
            const v = fazVideo('assets/media/hero-cine-loop.mp4');
            // Pedido do Robson: o fundo em camera MUITO lenta — metade da
            // velocidade original. Deriva quase imperceptivel, como cenario.
            v.playbackRate = 0.5;
            v.addEventListener('canplay', () => { v.playbackRate = 0.5; v.classList.add('on'); }, { once: true });
            palco.appendChild(v);
            // Fora da tela o vídeo pausa: rolou pros projetos, a bateria
            // do visitante não paga pelo que ele não está vendo.
            new IntersectionObserver(([e]) => {
                if (e.isIntersecting) { v.play().catch(() => {}); }
                else { v.pause(); }
            }, { threshold: 0.05 }).observe(hero);
        });

        /* Parallax: o fundo rola a ~30% da página, o conteúdo a 6%.
           É a diferença entre as velocidades que o olho lê como
           profundidade. O transform vai no PALCO — poster e vídeo
           andam juntos, e o scale(1.14) é a folga do deslize. */
        const conteudo = hero.querySelector('.wrap');
        let pedido = false;
        const parallax = () => {
            pedido = false;
            const y = Math.min(window.scrollY, hero.offsetHeight);
            palco.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0) scale(1.14)`;
            if (conteudo) conteudo.style.transform = `translate3d(0, ${(y * 0.06).toFixed(1)}px, 0)`;
        };
        window.addEventListener('scroll', () => {
            if (!pedido) { pedido = true; requestAnimationFrame(parallax); }
        }, { passive: true });
        parallax();
    }

    /* ---- Lenis: scroll com inércia (segredo #2) ----
       Só desktop com ponteiro fino; no toque o nativo é melhor. Se o
       CDN falhar, window.Lenis não existe e o site segue no scroll
       nativo — dependência de conforto, nunca de funcionamento. */
    const iniciarLenis = () => {
        if (!window.Lenis || !matchMedia('(pointer: fine)').matches) return;
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        // âncoras passam pelo Lenis pra manter a mesma inércia
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const alvo = document.querySelector(a.getAttribute('href'));
            if (!alvo) return;
            e.preventDefault();
            lenis.scrollTo(alvo, { offset: -90 });
        });
    };
    // O CDN e `defer`, o script principal nao e, e em producao o evento de
    // load se mostrou nao-confiavel pra essa danca. Polling curto resolve
    // sem depender de ordem nenhuma: acha o Lenis, inicia, para.
    let lenisPronto = false;
    const espera = setInterval(() => {
        if (window.Lenis && !lenisPronto) {
            lenisPronto = true;
            clearInterval(espera);
            iniciarLenis();
        }
    }, 200);
    setTimeout(() => clearInterval(espera), 10000);

    /* ---- retrato vivo (recorte com canal alpha) ----
       O webm VP9 carrega o alpha de verdade: ele respira SEM fundo, por
       cima do recorte estatico, no mesmo enquadramento (mesmo crop do
       trim do PNG — e por isso os dois se alinham pixel a pixel).
       Safari fica so com a foto: ele decodifica VP9 mas ignora o alpha
       e pintaria o fundo de preto. */
    // DESLIGADO (20/08): o clipe do Kling desloca o corpo alguns pixels ao
    // longo dos 5s. Sobreposto a foto estatica, o desvio vira "duas cabecas" —
    // e a mascara ainda vazou um rastro cinza na camiseta. So volta quando a
    // composicao estiver verificada frame a frame, e escondendo a foto
    // enquanto o video estiver visivel.
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const port = null && document.querySelector('.portrait--solto');
    if (port && !safari) {
        const v = fazVideo('assets/media/recorte-vivo.webm');
        v.addEventListener('canplay', () => v.classList.add('on'), { once: true });
        // entra DEPOIS da foto no DOM: foto carrega primeiro, vídeo assume
        // quando estiver pronto — a troca não tem flash.
        port.insertBefore(v, port.querySelector('figcaption'));
        new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { v.play().catch(() => {}); }
            else { v.pause(); }
        }, { threshold: 0.1 }).observe(port);
    }
})();
