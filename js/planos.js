// Planos e preços do site. Para mudar preço ou lista de funções, edite só a parte
// "DADOS" abaixo; a página Planos se monta sozinha a partir dela.
//
//   mensal / anual : preço em reais (número, com ponto: 49.90)
//   basico         : o que a versão grátis faz
//   pro            : o que a assinatura libera a mais
//   assinar        : endereço da página de pagamento (Mercado Pago) de cada plano.
//                    Enquanto estiver vazio, o botão aparece como "em breve".
//
// ATENÇÃO: preços e listas abaixo são EXEMPLOS para ver a página no lugar.

window.MUSIQUE_PLANOS = {
  // Enquanto true, a página mostra o aviso "valores de exemplo". Troque para false quando os preços forem os de verdade.
  provisorio: true,
  computadores: 2,
  apps: {
    mix: {
      nome: "Mix",
      mensal: 49.9,
      anual: 499,
      assinar: { mensal: "", anual: "" },
      basico: ["Controle da mesa: faders, EQ, dinâmica e mandadas", "Cenas guardadas na própria mesa", "Computador e celular"],
      pro: ["Cenas Universais", "Routing Inteligente", "Analyzer", "Feedback Hunter", "Auto Fader", "PA Alignment", "Transient", "Presets", "VS Player"],
    },
    vj: {
      nome: "VJ",
      mensal: 39.9,
      anual: 399,
      assinar: { mensal: "", anual: "" },
      basico: ["1 player e 1 saída de vídeo", "Vídeos, imagens e textos", "Blackout e fade"],
      pro: ["Vários players e várias saídas", "Warp e máscara de projeção", "Bíblia na tela", "Slides de PDF e PowerPoint", "Multiview das saídas"],
    },
    dj: {
      nome: "DJ",
      mensal: 29.9,
      anual: 299,
      assinar: { mensal: "", anual: "" },
      basico: ["2 decks com mixer e EQ", "Biblioteca, BPM e tom", "Hot cues, loops e sync", "Controladora MIDI"],
      pro: ["Efeitos", "Gravação do set", "Stems", "Disco de controle (DVS)", "Auto DJ"],
    },
    live: {
      nome: "Live",
      mensal: 39.9,
      anual: 399,
      assinar: { mensal: "", anual: "" },
      basico: ["Análise dos canais", "Sugestões de ganho, EQ, compressor e gate", "Aplicar ajustes um por um"],
      pro: ["Modo automático", "Aplicar todos de uma vez", "Masterização", "Comparação A/B"],
    },
    pacote: {
      nome: "Pacote completo",
      mensal: 119.9,
      anual: 1199,
      assinar: { mensal: "", anual: "" },
      basico: ["Versão básica dos quatro programas"],
      pro: ["Mix Pro", "VJ Pro", "DJ Pro", "Live Pro", "Uma chave só para os quatro"],
    },
  },
};

/* ===== daqui para baixo é a montagem da página; não precisa mexer ===== */
(function () {
  const D = window.MUSIQUE_PLANOS;
  const raiz = document.getElementById("planos");
  if (!D || !raiz) return;

  const reais = (v) => "R$ " + v.toFixed(2).replace(".", ",");
  const lista = (itens) => `<ul class="feat">${itens.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  const botao = (url, texto) =>
    url
      ? `<a class="btn btn-primary" href="${url}" rel="noopener">${texto}</a>`
      : `<span class="btn btn-primary" aria-disabled="true">${texto} · em breve</span>`;

  const abas = raiz.querySelector(".plan-apps");
  const corpo = raiz.querySelector(".plan-body");
  raiz.querySelector(".plan-aviso").hidden = !D.provisorio;
  abas.innerHTML = Object.entries(D.apps)
    .map(([id, a]) => `<button type="button" role="tab" data-plano="${id}" aria-selected="false">${a.nome}</button>`)
    .join("");

  function mostrar(id) {
    const a = D.apps[id];
    if (!a) return;
    abas.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.plano === id)));
    const porMes = a.anual / 12;
    const economia = Math.round((1 - a.anual / (a.mensal * 12)) * 100);
    const nome = id === "pacote" ? "Pacote completo" : a.nome + " Musique";
    corpo.innerHTML = `
      <div class="plans">
        <article class="plan">
          <span class="plan-k">Básico</span>
          <div class="plan-price">Grátis</div>
          <p class="plan-sub">Para sempre, sem cadastro.</p>
          ${lista(a.basico)}
          <button class="btn btn-line" type="button" data-go="downloads">Baixar</button>
        </article>
        <article class="plan">
          <span class="plan-k">Pro mensal</span>
          <div class="plan-price">${reais(a.mensal)}<small>/mês</small></div>
          <p class="plan-sub">Cobrado todo mês. Cancele quando quiser.</p>
          ${lista(["Tudo do Básico", ...a.pro])}
          ${botao(a.assinar.mensal, "Assinar mensal")}
        </article>
        <article class="plan hl">
          <span class="plan-k">Pro anual${economia > 0 ? ` <b>economize ${economia}%</b>` : ""}</span>
          <div class="plan-price">${reais(a.anual)}<small>/ano</small></div>
          <p class="plan-sub">Equivale a ${reais(porMes)} por mês. Uma conexão por ano basta.</p>
          ${lista(["Tudo do Básico", ...a.pro])}
          ${botao(a.assinar.anual, "Assinar anual")}
        </article>
      </div>
      <div class="cmp">
        <div class="cmp-row cmp-head"><span>${nome}</span><span>Básico</span><span>Pro</span></div>
        ${a.basico.map((t) => `<div class="cmp-row"><span>${t}</span><span class="sim">●</span><span class="sim">●</span></div>`).join("")}
        ${a.pro.map((t) => `<div class="cmp-row"><span>${t}</span><span class="nao">—</span><span class="sim">●</span></div>`).join("")}
      </div>`;
  }

  // Os botões "Ver planos Pro" das páginas de produto também trazem data-plano
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-plano]");
    if (t) mostrar(t.dataset.plano);
  });
  raiz.querySelectorAll("[data-computadores]").forEach((el) => (el.textContent = D.computadores));
  mostrar("mix");
})();
