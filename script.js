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

    // O scramble reescreve o texto a cada frame — e esse texto e o LCP da
    // pagina. Cada reescrita conta como "novo maior paint" e o Lighthouse
    // via o LCP la em 3.1s POR CAUSA da animacao. Ela agora espera a
    // primeira interacao humana: ninguem le a pagina sem mexer o mouse ou
    // tocar a tela, entao ninguem perde o efeito — mas o primeiro paint
    // fica estavel para o robo do Google, que e a porta de entrada do SEO.
    $$('[data-scramble]').forEach((el) => {
        if (reduced) { el.textContent = (el.dataset.words || '').split('|')[0] || el.textContent; return; }
        let comecou = false;
        const inicia = () => {
            if (comecou) return;
            comecou = true;
            new Scramble(el).start();
        };
        ['pointermove', 'touchstart', 'keydown', 'wheel'].forEach((ev) =>
            window.addEventListener(ev, inicia, { once: true, passive: true }));
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
    // Duas faixas em sentidos OPOSTOS, e a velocidade do scroll entorta as
    // duas (skew). O sinal do delta importa: rolar pra baixo inclina pra um
    // lado, pra cima pro outro — o texto parece arrastado pelo proprio scroll.
    let marqueeTick = null;
    {
        const faixas = [
            { el: $('#marquee'),      dir: -1, vel: 0.55 },
            { el: $('#marqueeVolta'), dir:  1, vel: 0.38 },
        ].filter((f) => f.el);

        if (faixas.length && !reduced) {
            for (const f of faixas) {
                const set = f.el.firstElementChild;
                while (f.el.scrollWidth < window.innerWidth * 2) {
                    f.el.appendChild(set.cloneNode(true));
                }
                f.unit = set.getBoundingClientRect().width;
                f.off = 0;
            }
            let boost = 0;
            let skewAlvo = 0;
            let skew = 0;

            marqueeTick = (delta) => {
                boost = Math.min(Math.abs(delta) * 0.35, 14);
                skewAlvo = Math.max(-7, Math.min(7, delta * 0.06));
            };

            const loop = () => {
                boost *= 0.92;
                skewAlvo *= 0.9;
                skew += (skewAlvo - skew) * 0.12;
                for (const f of faixas) {
                    f.off += f.dir * (f.vel + boost);
                    if (f.off <= -f.unit) f.off += f.unit;
                    if (f.off > 0) f.off -= f.unit;
                    f.el.style.transform = `translate3d(${f.off.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
                }
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }
    }

    /* ---------------------------------------------------------
       Sticky work stack — cards recede as the next one covers them
       --------------------------------------------------------- */
    const works = $$('#workStack .work');
    const stackable = () => window.matchMedia('(min-width: 1025px)').matches;

    const paintStack = () => {
        if (!works.length) return;
        if (!stackable()) {
            works.forEach((w) => {
                w.style.setProperty('--stackScale', '1');
                w.style.setProperty('--stackY', '0px');
            });
            return;
        }
        works.forEach((card, i) => {
            const next = works[i + 1];
            if (!next) {
                card.style.setProperty('--stackScale', '1');
                card.style.setProperty('--stackY', '0px');
                return;
            }
            const r = next.getBoundingClientRect();
            const cardTop = card.getBoundingClientRect().top;
            // how far the next card has travelled over this one (0 → 1)
            const span = window.innerHeight * 0.75;
            const p = Math.min(Math.max((span - (r.top - cardTop)) / span, 0), 1);
            // Escreve em VARIAVEIS, nao no transform: o tilt do cursor
            // tambem quer o transform deste elemento. Cada um escreve a
            // sua parte e o CSS compoe — sem os dois se sobrescreverem.
            card.style.setProperty('--stackScale', (1 - p * 0.05).toFixed(4));
            card.style.setProperty('--stackY', (p * -14).toFixed(1) + 'px');
        });
    };

    /* ---------------------------------------------------------
       Sobre: o texto acende palavra por palavra com o scroll.
       O paragrafo comeca quase apagado e a leitura vai sendo
       "pintada" conforme desce — com a inercia do Lenis, parece
       que o scroll e quem escreve. <strong> e preservado.
       --------------------------------------------------------- */
    const acendiveis = [];
    if (!reduced) {
        $$('.about-lead, .about-body p').forEach((par) => {
            const quebra = (node) => {
                [...node.childNodes].forEach((filho) => {
                    if (filho.nodeType === 3) {
                        const frag = document.createDocumentFragment();
                        filho.textContent.split(/(\s+)/).forEach((peda) => {
                            if (!peda) return;
                            if (/^\s+$/.test(peda)) { frag.appendChild(document.createTextNode(peda)); return; }
                            const sp = document.createElement('span');
                            sp.className = 'palavra';
                            sp.textContent = peda;
                            frag.appendChild(sp);
                        });
                        node.replaceChild(frag, filho);
                    } else if (filho.nodeType === 1) {
                        quebra(filho);
                    }
                });
            };
            quebra(par);
            acendiveis.push({ par, spans: $$('.palavra', par), acesas: 0 });
        });
    }

    const paintPalavras = () => {
        if (!acendiveis.length) return;
        const vh = window.innerHeight;
        for (const a of acendiveis) {
            const r = a.par.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) continue;
            const prog = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (vh * 0.5)));
            const alvo = Math.round(prog * a.spans.length);
            if (alvo === a.acesas) continue;
            const [de, ate, liga] = alvo > a.acesas ? [a.acesas, alvo, true] : [alvo, a.acesas, false];
            for (let i = de; i < ate; i++) a.spans[i].classList.toggle('lit', liga);
            a.acesas = alvo;
        }
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
        paintPalavras();
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
    paintPalavras();

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
        // sem chamada inicial: transform so aparece quando o usuario rola —
        // nada re-rasteriza o texto da dobra durante o carregamento
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

/* =========================================================
   Constelação neural — canvas vivo atrás da seção Sobre.
   Nós derivam devagar; linhas nascem entre vizinhos e entre
   cada nó e o cursor. É a assinatura visual de "IA" sem uma
   biblioteca sequer. Só desktop com ponteiro fino, pausa
   fora da tela, e respeita reduced-motion.
   ========================================================= */
(() => {
    'use strict';
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino = window.matchMedia('(pointer: fine)').matches;
    if (reduzido || !fino || window.innerWidth < 1024) return;

    const secao = document.querySelector('#about');
    if (!secao) return;

    const cv = document.createElement('canvas');
    cv.className = 'constelacao';
    cv.setAttribute('aria-hidden', 'true');
    secao.prepend(cv);
    const ctx = cv.getContext('2d');

    const DPR = Math.min(devicePixelRatio || 1, 1.5);
    let W = 0, H = 0;
    const dimensiona = () => {
        const r = cv.getBoundingClientRect();
        W = r.width; H = r.height;
        cv.width = W * DPR; cv.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    dimensiona();
    window.addEventListener('resize', dimensiona, { passive: true });

    // densidade proporcional à área, com teto — tela grande não vira nevasca
    const N = Math.min(90, Math.round((W * H) / 26000));
    const nos = Array.from({ length: N }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.8 + Math.random() * 1.4,
    }));

    // cursor em coordenadas do canvas (-1 = fora)
    const mouse = { x: -1, y: -1 };
    window.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    }, { passive: true });

    const LIGA = 130;      // distância máxima entre nós ligados
    const LIGA_MOUSE = 190;

    let rodando = false;
    const desenha = () => {
        if (!rodando) return;
        ctx.clearRect(0, 0, W, H);

        for (const n of nos) {
            n.x += n.vx; n.y += n.vy;
            if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
        }

        // linhas nó-a-nó (violeta, quase sussurro)
        for (let i = 0; i < N; i++) {
            const a = nos[i];
            for (let j = i + 1; j < N; j++) {
                const b = nos[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > LIGA * LIGA) continue;
                const f = 1 - Math.sqrt(d2) / LIGA;
                ctx.strokeStyle = `rgba(124, 92, 255, ${(f * 0.14).toFixed(3)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // o cursor é um nó especial: as linhas até ele são ciano e mais vivas
        if (mouse.x >= 0 && mouse.y >= 0 && mouse.y <= H) {
            for (const n of nos) {
                const dx = n.x - mouse.x, dy = n.y - mouse.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > LIGA_MOUSE * LIGA_MOUSE) continue;
                const f = 1 - Math.sqrt(d2) / LIGA_MOUSE;
                ctx.strokeStyle = `rgba(34, 211, 238, ${(f * 0.28).toFixed(3)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        // os nós por último, acima das linhas
        for (const n of nos) {
            ctx.fillStyle = 'rgba(176, 108, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(desenha);
    };

    // só gasta bateria quando a seção está na tela
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !rodando) {
            rodando = true;
            cv.classList.add('on');
            requestAnimationFrame(desenha);
        } else if (!e.isIntersecting) {
            rodando = false;
        }
    }, { threshold: 0.05 }).observe(secao);
})();

/* =========================================================
   Projetos: tilt 3D, cascata das techs e o eco do número.
   Bloco próprio — se falhar, a pilha sticky continua inteira.
   ========================================================= */
(() => {
    'use strict';
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = [...document.querySelectorAll('#workStack .work')];
    if (!cards.length) return;

    cards.forEach((card, i) => {
        // o número vira marca d'água gigante atrás do rótulo
        const idx = card.querySelector('.work-index');
        if (idx) idx.dataset.eco = String(i + 1).padStart(2, '0');

        // cascata das tags: cada uma entra um pouco depois da anterior
        card.querySelectorAll('.work-tech span').forEach((sp, k) => {
            sp.style.setProperty('--dt', (k * 55) + 'ms');
        });
    });

    if (reduzido) {
        cards.forEach((c) => c.classList.add('visto'));
        return;
    }

    // a cascata dispara quando o card entra de verdade na tela
    const io = new IntersectionObserver((ents) => {
        ents.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('visto');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.25 });
    cards.forEach((c) => io.observe(c));

    /* ---- tilt 3D ----
       Só no ponteiro fino: em toque, inclinação sem cursor é ruído.
       O ângulo é pequeno de propósito (4°) — cartão que gira demais
       vira brinquedo e tira a atenção do que importa, o projeto. */
    if (!window.matchMedia('(pointer: fine)').matches) return;

    cards.forEach((card) => {
        let dentro = false;

        card.addEventListener('pointerenter', () => {
            dentro = true;
            // sem transição durante o movimento: ela vira borracha e o card
            // fica sempre atrás do cursor
            card.style.transition = 'none';
        });

        card.addEventListener('pointermove', (e) => {
            if (!dentro) return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            // o stack já escreve transform (scale/translate) na pilha;
            // guardamos o tilt numa var e o paintStack respeita.
            card.style.setProperty('--tiltX', (-py * 4).toFixed(2) + 'deg');
            card.style.setProperty('--tiltY', (px * 4).toFixed(2) + 'deg');
            card.classList.add('tiltando');
        });

        card.addEventListener('pointerleave', () => {
            dentro = false;
            card.style.transition = '';
            card.style.setProperty('--tiltX', '0deg');
            card.style.setProperty('--tiltY', '0deg');
            card.classList.remove('tiltando');
        });
    });
})();
