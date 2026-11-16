/* Aba Downloads: um cartão por programa (js/apps.js), com a tela dele e um
   botão por sistema. Na fase de desenvolvimento os instaladores ficam cifrados
   em downloads/ e só baixam com a senha de acesso; um sistema com "url" em
   js/apps.js baixa direto, sem senha.
   Também liga os botões "Download" das abas de cada programa a esta página. */
(function(){
  const DADOS = window.MUSIQUE_DOWNLOADS || {};
  const ORDEM = ["mix", "vj", "dj", "live"];
  const SISTEMAS = {windows:"Windows", mac:"macOS", linux:"Linux", android:"Android"};
  const $ = s => document.querySelector(s);

  const css = document.createElement("style");
  css.textContent = `
  .dl-trava{display:grid;gap:10px;margin:22px 0 6px;padding:16px 18px;border:1px solid var(--line2);border-radius:6px;background:var(--panel)}
  .dl-trava h3{font-size:16px;display:flex;gap:8px;align-items:center}
  .dl-trava p{color:var(--muted);font-size:14px}
  .dl-trava form{display:flex;flex-wrap:wrap;gap:8px}
  .dl-trava input{flex:1 1 200px;min-width:0;padding:10px 12px;border-radius:5px;border:1px solid var(--line2);background:var(--matte);color:var(--white);font:15px var(--font-body)}
  .dl-trava input:focus{outline:2px solid var(--orange);outline-offset:1px}
  .dl-trava .dl-msg{min-height:1.2em;font-size:13.5px}
  .dl-trava.liberada{border-color:rgba(92,207,143,.45)}
  .dl-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:18px}
  .dl-card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:6px;background:var(--graphite);overflow:hidden;scroll-margin-top:90px;transition:border-color .3s,box-shadow .3s}
  .dl-card.foco{border-color:var(--orange);box-shadow:0 0 0 3px var(--orange-soft)}
  .dl-foto{aspect-ratio:16/9;background:var(--matte);display:grid;place-items:center;border-bottom:1px solid var(--line)}
  .dl-foto img{width:100%;height:100%;object-fit:cover;display:block}
  .dl-foto b{font:700 30px var(--font-display);letter-spacing:.04em;color:var(--dim)}
  .dl-corpo{display:grid;gap:6px;padding:14px 16px 16px;flex:1;align-content:start}
  .dl-corpo .cat{font:500 11px var(--font-mono);color:var(--orange);letter-spacing:.08em;text-transform:uppercase}
  .dl-corpo p{color:var(--muted);font-size:14px}
  .dl-versao{font:500 12px var(--font-mono);color:var(--dim)}
  .dl-sist{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
  .dl-sist .btn{justify-content:center;padding:9px 10px;font-size:14px}
  .dl-sist .btn[disabled]{border:1px dashed var(--line2);color:var(--dim);cursor:not-allowed;background:none}
  .dl-sist .btn small{font:500 11px var(--font-mono);opacity:.75}
  .dl-barra{height:4px;border-radius:2px;background:var(--line);overflow:hidden;margin-top:8px}
  .dl-barra i{display:block;height:100%;width:0;background:var(--orange);transition:width .15s}
  .dl-aviso{font-size:13.5px;min-height:1.2em;color:var(--muted)}
  .dl-aviso.ok{color:var(--ok)} .dl-aviso.erro{color:#ff6b6b}
  .dl-topo{margin-top:14px}`;
  document.head.appendChild(css);

  function detectarSistema(){
    const dica = (navigator.userAgentData && navigator.userAgentData.platform) || "";
    const texto = (dica+" "+navigator.userAgent).toLowerCase();
    /* Android se anuncia como Linux e o iPad como Mac, por isso vêm antes. */
    if(texto.includes("android")) return "android";
    if(/iphone|ipad|ipod/.test(texto)) return null;
    if(texto.includes("win")) return "windows";
    if(texto.includes("mac")) return navigator.maxTouchPoints>1 ? null : "mac";
    if(texto.includes("linux") || texto.includes("x11")) return "linux";
    return null;
  }
  const meuSistema = detectarSistema();
  const sistemasDe = app => Object.keys(SISTEMAS).filter(k => app[k]);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const mb = n => (n/1048576).toFixed(n > 10485760 ? 0 : 1) + " MB";
  const dataBR = d => d ? d.split("-").reverse().join("/") : "";

  let indice = null, chave = null;

  /* ---- cifra (o mesmo formato de ferramentas/publicar-download.js) ---- */
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function chaveDe(senha){
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({name:"PBKDF2", salt:b64(indice.sal), iterations:indice.voltas, hash:"SHA-256"},
      base, {name:"AES-GCM", length:256}, false, ["decrypt"]);
  }
  const decifrar = (k, bytes) => crypto.subtle.decrypt({name:"AES-GCM", iv:bytes.slice(0,12)}, k, bytes.slice(12));

  const lista = $("#dl-lista"), trava = $("#dl-trava");

  function arquivoDe(id, sis){
    const p = indice && indice.programas && indice.programas[id];
    return p && p.arquivos && p.arquivos[sis] || null;
  }
  function montar(){
    if(!lista) return;
    lista.innerHTML = ORDEM.filter(id => DADOS[id]).map((id, n) => {
      const app = DADOS[id], prog = indice && indice.programas && indice.programas[id];
      const sist = sistemasDe(app).sort((a, b) => (b === meuSistema) - (a === meuSistema));
      const botoes = sist.map(s => {
        const url = app[s].url, arq = arquivoDe(id, s);
        if(url) return `<a class="btn ${s===meuSistema?"btn-primary":"btn-line"}" href="${esc(url)}" rel="noopener">${SISTEMAS[s]}</a>`;
        if(arq) return `<button type="button" class="btn ${s===meuSistema?"btn-primary":"btn-line"}" data-baixar="${id}:${s}">${SISTEMAS[s]} <small>${mb(arq.bytes)}</small></button>`;
        return `<button type="button" class="btn" disabled>${SISTEMAS[s]} <small>em breve</small></button>`;
      }).join("");
      const temAlgum = sist.some(s => app[s].url || arquivoDe(id, s));
      return `<article class="dl-card" id="dl-${id}">
        <div class="dl-foto">${app.imagem ? `<img src="${esc(app.imagem)}" alt="Tela do ${esc(app.nome)}" loading="lazy">` : `<b>${esc(app.nome).toUpperCase()}</b>`}</div>
        <div class="dl-corpo">
          <span class="cat">CH ${String(n+1).padStart(2,"0")} · ${esc(app.nome)} Musique</span>
          <p>${esc(app.descricao||"")}</p>
          <span class="dl-versao">${prog && temAlgum ? `versão ${esc(prog.versao)} · ${dataBR(prog.data)}` : "em breve"}</span>
          <div class="dl-sist">${botoes}</div>
          <div class="dl-barra" hidden><i></i></div>
          <div class="dl-aviso" data-aviso></div>
        </div>
      </article>`;
    }).join("");
    lista.querySelectorAll("[data-baixar]").forEach(b => b.addEventListener("click", () => baixar(b)));
  }

  function mostrarTrava(){
    if(!trava) return;
    const precisa = indice && Object.values(indice.programas||{}).some(p => Object.keys(p.arquivos||{}).length);
    trava.hidden = !precisa;
    trava.classList.toggle("liberada", !!chave);
    trava.innerHTML = chave
      ? `<h3><span style="color:var(--ok)">●</span> Downloads liberados nesta visita</h3><p>Escolha o programa e o sistema abaixo.</p>`
      : `<h3><span style="color:var(--orange)">●</span> Área em fase de testes</h3>
         <p>Enquanto os programas estão em desenvolvimento, os instaladores só baixam com a senha de acesso. Depois do lançamento o download fica livre e as funções Pro são ativadas pela chave de registro.</p>
         <form id="dl-form"><input id="dl-senha" type="password" autocomplete="current-password" placeholder="Senha de acesso" aria-label="Senha de acesso" required><button class="btn btn-primary" type="submit">Liberar downloads</button></form>
         <div class="dl-msg" role="alert"></div>`;
    const f = $("#dl-form");
    if(f) f.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = trava.querySelector(".dl-msg"), botao = f.querySelector("button");
      botao.disabled = true; msg.style.color = "var(--muted)"; msg.textContent = "Conferindo…";
      try {
        const k = await chaveDe($("#dl-senha").value);
        await decifrar(k, b64(indice.verificador));
        chave = k; mostrarTrava();
      } catch(x) { msg.style.color = "#ff6b6b"; msg.textContent = "Senha incorreta."; botao.disabled = false; }
    });
  }

  async function baixar(botao){
    const [id, sis] = botao.dataset.baixar.split(":"), arq = arquivoDe(id, sis);
    const card = botao.closest(".dl-card"), barra = card.querySelector(".dl-barra"), tira = barra.querySelector("i"), aviso = card.querySelector("[data-aviso]");
    if(!chave){
      trava.scrollIntoView({behavior:"smooth", block:"center"});
      const s = $("#dl-senha"); if(s) setTimeout(() => s.focus(), 400);
      aviso.className = "dl-aviso erro"; aviso.textContent = "Digite a senha de acesso acima para baixar.";
      return;
    }
    card.querySelectorAll("[data-baixar]").forEach(b => b.disabled = true);
    barra.hidden = false; tira.style.width = "0"; aviso.className = "dl-aviso"; aviso.textContent = "Baixando " + arq.nome + "…";
    try {
      const r = await fetch("downloads/arquivos/" + arq.bin);
      if(!r.ok) throw new Error("Arquivo indisponível (" + r.status + ").");
      const total = +r.headers.get("content-length") || arq.bytes + 28;
      const leitor = r.body.getReader(), pedacos = []; let veio = 0;
      for(;;){ const {done, value} = await leitor.read(); if(done) break; pedacos.push(value); veio += value.length; tira.style.width = Math.min(100, veio/total*100) + "%"; }
      const tudo = new Uint8Array(veio); let o = 0; pedacos.forEach(p => { tudo.set(p, o); o += p.length; });
      aviso.textContent = "Preparando o arquivo…";
      const claro = await decifrar(chave, tudo);
      const tipo = sis === "android" ? "application/vnd.android.package-archive" : "application/octet-stream";
      const url = URL.createObjectURL(new Blob([claro], {type:tipo}));
      const l = document.createElement("a"); l.href = url; l.download = arq.nome; document.body.appendChild(l); l.click(); l.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      aviso.className = "dl-aviso ok"; aviso.textContent = "Pronto: " + arq.nome + " foi para os downloads.";
    } catch(x) {
      aviso.className = "dl-aviso erro";
      aviso.textContent = x.name === "OperationError" ? "O arquivo veio corrompido. Tente de novo." : x.message;
    } finally { card.querySelectorAll("[data-baixar]").forEach(b => b.disabled = false); }
  }

  /* ---- botões "Download" nas abas dos programas ---- */
  /* o botão do fim de cada aba ("Download em breve") passa a levar aos downloads */
  document.querySelectorAll("[data-dl]").forEach(antigo => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn btn-primary"; b.dataset.go = "downloads"; b.dataset.dlFoco = antigo.dataset.dl; b.textContent = "Download";
    antigo.replaceWith(b);
  });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-dl-foco]"); if(!t) return;
    setTimeout(() => {
      const c = document.getElementById("dl-" + t.dataset.dlFoco); if(!c) return;
      c.scrollIntoView({behavior:"smooth", block:"center"});
      c.classList.add("foco"); setTimeout(() => c.classList.remove("foco"), 2200);
    }, 380);
  });

  montar();
  fetch("downloads/indice.json", {cache:"no-store"})
    .then(r => r.ok ? r.json() : null)
    .then(j => { indice = j; montar(); mostrarTrava(); })
    .catch(() => {});
})();
