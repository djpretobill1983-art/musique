// Programas da aba Downloads. A página se monta sozinha a partir daqui.
//
//   nome, descricao : o que aparece no cartão
//   imagem          : tela do programa (vazio = cartão sem foto, só o nome)
//   windows/mac/linux/android : os sistemas que o programa terá. Apague a
//                     linha de um sistema que o programa não vai ter.
//
// FASE DE DESENVOLVIMENTO (agora): os instaladores são publicados CIFRADOS com
// a senha de acesso, pelo comando
//   node ferramentas/publicar-download.js <programa> <versao> <sistema>=<arquivo> ...
// que grava em downloads/ (arquivos/*.bin e indice.json). Sem arquivo
// publicado, o sistema aparece como "em breve". Aqui não se mexe para isso.
//
// DEPOIS (sem senha): cole o endereço público do instalador em "url". Um
// sistema com "url" preenchido baixa direto, sem pedir senha. No Android, quando
// o app entrar na Play Store, o "url" é o endereço dele na loja.

window.MUSIQUE_DOWNLOADS = {
  mix: {
    nome: "Mix",
    descricao: "Controle universal de mixers.",
    imagem: "telas/med/pc-02-overview.webp",
    windows: { url: "" },
    mac: { url: "" },
    linux: { url: "" },
    android: { url: "" },
  },
  vj: {
    nome: "VJ",
    descricao: "Media server e vídeo ao vivo.",
    imagem: "",
    windows: { url: "" },
    mac: { url: "" },
    linux: { url: "" },
  },
  dj: {
    nome: "DJ",
    descricao: "Performance musical.",
    imagem: "telas/med/dj-01-decks.webp",
    windows: { url: "" },
    mac: { url: "" },
    linux: { url: "" },
  },
  live: {
    nome: "Live",
    descricao: "Operação de áudio e vídeo ao vivo.",
    imagem: "telas/med/live-02-ajustes.webp",
    windows: { url: "" },
    mac: { url: "" },
    linux: { url: "" },
  },
};
