// Downloads do site. Este é o único arquivo que precisa ser editado para
// publicar um instalador.
//
// Para liberar um download: cole o endereço do instalador em "url" e preencha
// "versao". Enquanto "url" estiver vazio, a plataforma aparece como "em breve".
// Os instaladores não ficam nesta pasta: são grandes demais para a hospedagem
// do site, então ficam em um serviço de arquivos (ex.: GitHub Releases) e aqui
// vai só o endereço. No Android, "url" é o endereço do arquivo APK; quando o
// app entrar na Play Store, troque pelo endereço dele na loja.
//
// Para tirar uma plataforma de um programa, apague a linha dela.

window.MUSIQUE_DOWNLOADS = {
  // Temporário: ensaio de distribuição. Apagar junto com a linha "teste" do index.html.
  teste: {
    versao: "0.0.1",
    windows: { url: "https://github.com/djpretobill1983-art/musique/releases/download/teste-v0.0.1/Sistema-Integrado-Fadale-Setup-0.0.1.exe" },
  },
  mix: {
    versao: "",
    windows: { url: "" },
    linux: { url: "" },
    mac: { url: "" },
    android: { url: "" },
  },
  vj: {
    versao: "",
    windows: { url: "" },
    linux: { url: "" },
    mac: { url: "" },
  },
  dj: {
    versao: "",
    windows: { url: "" },
    linux: { url: "" },
    mac: { url: "" },
  },
  live: {
    versao: "",
    windows: { url: "" },
    linux: { url: "" },
    mac: { url: "" },
  },
};
