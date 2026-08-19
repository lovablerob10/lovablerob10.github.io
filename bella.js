/* =========================================================
   BELLA — atendimento no site
   Mesma IA que atende no WhatsApp. Conversa aqui, continua lá.
   ========================================================= */
(() => {
    'use strict';

    // Endereço do motor. Enquanto estiver vazio, o widget não tenta conversar:
    // vira um atalho honesto para o WhatsApp em vez de um chat que erra.
    // Preencher com: https://farolead.robsonobre.com.br/api/bella/web
    const API = window.BELLA_API || '';

    const ZAP = 'https://wa.me/5519996597169';
    const CHAVE_TOKEN = 'bella.token';
    const CHAVE_LOG = 'bella.log';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       Marcação
       --------------------------------------------------------- */
    const root = document.createElement('div');
    root.className = 'bella';
    root.innerHTML = `
        <button class="bella-fab" type="button" aria-expanded="false" aria-controls="bella-painel">
            <span class="bella-fab-on" aria-hidden="true"></span>
            <span class="bella-fab-txt">Falar com a Bella</span>
        </button>

        <section class="bella-painel" id="bella-painel" hidden aria-label="Conversa com a Bella">
            <header class="bella-topo">
                <div class="bella-eu">
                    <span class="bella-av" aria-hidden="true">B</span>
                    <div>
                        <strong>Bella</strong>
                        <span class="bella-sub">IA do Robson · responde na hora</span>
                    </div>
                </div>
                <button class="bella-fechar" type="button" aria-label="Fechar conversa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </header>

            <div class="bella-log" role="log" aria-live="polite"></div>

            <form class="bella-form">
                <input class="bella-input" type="text" autocomplete="off"
                       placeholder="Escreve aqui…" aria-label="Sua mensagem" maxlength="1500">
                <button class="bella-enviar" type="submit" aria-label="Enviar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </form>
        </section>
    `;
    document.body.appendChild(root);

    const fab = root.querySelector('.bella-fab');
    const painel = root.querySelector('.bella-painel');
    const log = root.querySelector('.bella-log');
    const form = root.querySelector('.bella-form');
    const input = root.querySelector('.bella-input');
    const fechar = root.querySelector('.bella-fechar');

    /* ---------------------------------------------------------
       Estado
       --------------------------------------------------------- */
    let token = null;
    let historico = [];
    let ocupada = false;

    try {
        token = localStorage.getItem(CHAVE_TOKEN);
        historico = JSON.parse(localStorage.getItem(CHAVE_LOG) || '[]');
    } catch { /* navegador sem storage: a conversa só não sobrevive ao reload */ }

    const guardar = () => {
        try {
            if (token) localStorage.setItem(CHAVE_TOKEN, token);
            localStorage.setItem(CHAVE_LOG, JSON.stringify(historico.slice(-40)));
        } catch { /* idem */ }
    };

    /* ---------------------------------------------------------
       Render
       --------------------------------------------------------- */
    function bolha(quem, texto) {
        const b = document.createElement('div');
        b.className = 'bella-msg bella-msg--' + quem;
        b.textContent = texto;
        log.appendChild(b);
        log.scrollTop = log.scrollHeight;
        return b;
    }

    function digitando() {
        const d = document.createElement('div');
        d.className = 'bella-msg bella-msg--bella bella-digitando';
        d.innerHTML = '<i></i><i></i><i></i>';
        d.setAttribute('aria-label', 'Bella está digitando');
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
        return d;
    }

    function abrirZap(texto) {
        const url = texto ? ZAP + '?text=' + encodeURIComponent(texto) : ZAP;
        window.open(url, '_blank', 'noopener');
    }

    /* ---------------------------------------------------------
       Conversa
       --------------------------------------------------------- */
    async function mandar(texto) {
        if (ocupada) return;
        ocupada = true;
        input.value = '';
        bolha('eu', texto);
        historico.push({ role: 'user', content: texto });
        guardar();

        const pensando = digitando();

        try {
            const r = await fetch(API, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ token, mensagem: texto }),
            });
            const j = await r.json();
            pensando.remove();

            if (j.token) { token = j.token; }
            const reply = j.reply || 'Não consegui responder agora. Me chama no WhatsApp que eu te respondo na hora.';
            bolha('bella', reply);
            historico.push({ role: 'assistant', content: reply });
            guardar();

            // Bateu num limite: o chat não é mais o lugar da conversa.
            if (j.limite) {
                const ir = document.createElement('button');
                ir.className = 'bella-zap';
                ir.type = 'button';
                ir.textContent = 'Continuar no WhatsApp';
                ir.addEventListener('click', () => abrirZap('Oi! Vim do site, estava conversando com a Bella.'));
                log.appendChild(ir);
                log.scrollTop = log.scrollHeight;
            }
        } catch {
            pensando.remove();
            // O motor caiu ou está fora do ar. Não fingir que respondeu:
            // entregar o caminho que funciona.
            const b = bolha('bella', 'Meu sistema está fora do ar agora. Fala comigo no WhatsApp que eu te respondo na hora.');
            const ir = document.createElement('button');
            ir.className = 'bella-zap';
            ir.type = 'button';
            ir.textContent = 'Abrir WhatsApp';
            ir.addEventListener('click', () => abrirZap('Oi! Vim pelo site.'));
            b.after(ir);
            log.scrollTop = log.scrollHeight;
        } finally {
            ocupada = false;
            input.focus();
        }
    }

    /* ---------------------------------------------------------
       Abrir e fechar
       --------------------------------------------------------- */
    let jaAbriu = false;

    function abrir() {
        // Sem motor configurado o widget não finge ser chat.
        if (!API) { abrirZap('Oi! Vim pelo site.'); return; }

        painel.hidden = false;
        requestAnimationFrame(() => root.classList.add('bella--aberta'));
        fab.setAttribute('aria-expanded', 'true');

        if (!jaAbriu) {
            jaAbriu = true;
            if (historico.length) {
                historico.forEach((h) => bolha(h.role === 'user' ? 'eu' : 'bella', h.content));
            } else {
                bolha('bella', 'Oi! Eu sou a Bella, a IA do Robson. Me conta: qual é o seu negócio e o que você queria resolver?');
            }
        }
        setTimeout(() => input.focus(), reduced ? 0 : 320);
    }

    function fecharPainel() {
        root.classList.remove('bella--aberta');
        fab.setAttribute('aria-expanded', 'false');
        setTimeout(() => { painel.hidden = true; }, reduced ? 0 : 300);
    }

    fab.addEventListener('click', () => {
        root.classList.contains('bella--aberta') ? fecharPainel() : abrir();
    });
    fechar.addEventListener('click', fecharPainel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && root.classList.contains('bella--aberta')) fecharPainel();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const t = input.value.trim();
        if (t) mandar(t);
    });
})();
