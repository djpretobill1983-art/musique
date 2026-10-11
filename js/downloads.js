/* Liga os botões e a lista de downloads aos dados de js/apps.js. */
(function(){
  const DADOS = window.MUSIQUE_DOWNLOADS || {};
  const PLATAFORMAS = {windows:"Windows", linux:"Linux", mac:"macOS", android:"Android"};

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
  const sistema = detectarSistema();
  const plataformasDe = app => Object.keys(app).filter(k=>PLATAFORMAS[k]);

  /* lista da seção Downloads */
  document.querySelectorAll("[data-dl-linha]").forEach(linha=>{
    const app = DADOS[linha.dataset.dlLinha]; if(!app) return;
    const chips = document.createElement("div");
    chips.className = "chips"; chips.style.cssText = "justify-content:flex-end;max-width:300px";
    plataformasDe(app).forEach(k=>{
      const url = app[k].url;
      const c = document.createElement(url?"a":"span");
      if(url){ c.className="chip st"; c.href=url; c.rel="noopener"; c.style.textDecoration="none"; c.textContent=PLATAFORMAS[k]+(app.versao?" · "+app.versao:""); }
      else { c.className="chip soon"; c.textContent=PLATAFORMAS[k]+" · em breve"; }
      chips.appendChild(c);
    });
    const antigo = linha.querySelector(".chip");
    if(antigo) antigo.replaceWith(chips); else linha.appendChild(chips);
  });

  /* botão principal de cada produto */
  document.querySelectorAll("[data-dl]").forEach(botao=>{
    const app = DADOS[botao.dataset.dl]; if(!app) return;
    const meu = sistema && app[sistema] && app[sistema].url;
    const algum = plataformasDe(app).some(k=>app[k].url);
    if(meu){
      const a = document.createElement("a");
      a.className="btn btn-primary"; a.href=meu; a.rel="noopener"; a.textContent="Baixar para "+PLATAFORMAS[sistema];
      botao.replaceWith(a);
    } else if(algum){
      const b = document.createElement("button");
      b.type="button"; b.className="btn btn-primary"; b.dataset.go="downloads"; b.textContent="Ver downloads";
      botao.replaceWith(b);
    }
  });
})();
