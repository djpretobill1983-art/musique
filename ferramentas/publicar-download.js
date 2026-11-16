#!/usr/bin/env node
/*
 * Publica os instaladores de UM programa na aba Downloads do site, cifrados com
 * a senha de acesso (fase de desenvolvimento: sem a senha, o arquivo publicado
 * é só ruído).
 *
 *   MUSIQUE_SENHA=<senha> node ferramentas/publicar-download.js <programa> <versao> <sistema>=<arquivo> [...]
 *
 *   programa : mix, vj, dj, live (as chaves de js/apps.js)
 *   sistema  : windows, mac, linux, android
 *   exemplo  : ... publicar-download.js mix v20 windows=Setup.exe android=Mix.apk
 *
 * A senha vem da variável MUSIQUE_SENHA (assim ela não fica no histórico do
 * terminal). Todos os programas usam a MESMA senha: o índice guarda o sal e um
 * verificador, e a senha digitada tem de bater com ele. Na primeira vez, se
 * existir o índice antigo da página teste-mix, a senha é conferida com ele.
 *
 * Só os sistemas passados são trocados; os outros sistemas e os outros
 * programas ficam como estão. Os .bin substituídos são apagados.
 *
 * Formato de cada .bin: iv (12 bytes) + AES-256-GCM. Chave: PBKDF2-SHA256 da
 * senha com o sal e as voltas de downloads/indice.json.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const SISTEMAS = ['windows', 'mac', 'linux', 'android'];
const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'downloads');
const SAIDA = path.join(PASTA, 'arquivos');
const INDICE = path.join(PASTA, 'indice.json');
const ANTIGO = path.join(RAIZ, 'teste-mix', 'arquivos.json');
const VOLTAS = 250000;
/* O GitHub recusa arquivo acima de 100 MB; o cifrado tem 28 bytes a mais. */
const LIMITE = 100 * 1024 * 1024 - 28;

function falha(msg) { console.error('ERRO: ' + msg); process.exit(1); }

const senha = process.env.MUSIQUE_SENHA || '';
const [programa, versao, ...pares] = process.argv.slice(2);
if (!senha) falha('defina a senha em MUSIQUE_SENHA.');
if (!programa || !versao || !pares.length) falha('uso: publicar-download.js <programa> <versao> <sistema>=<arquivo> [...]');
if (!/^[a-z0-9-]+$/.test(programa)) falha('nome de programa inválido: ' + programa);

const entradas = pares.map(p => {
  const i = p.indexOf('=');
  const sistema = p.slice(0, i), arquivo = p.slice(i + 1);
  if (i < 1 || !SISTEMAS.includes(sistema)) falha(`"${p}": use <sistema>=<arquivo>, sistema entre ${SISTEMAS.join(', ')}`);
  if (!fs.existsSync(arquivo)) falha('arquivo não encontrado: ' + arquivo);
  const bytes = fs.statSync(arquivo).size;
  if (bytes > LIMITE) falha(`${path.basename(arquivo)} tem ${(bytes / 1048576).toFixed(1)} MB; o GitHub recusa arquivo acima de 100 MB.`);
  return { sistema, arquivo, bytes };
});

const chaveDe = sal => crypto.pbkdf2Sync(senha, sal, VOLTAS, 32, 'sha256');
function cifrar(chave, dados) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave, iv);
  return Buffer.concat([iv, c.update(dados), c.final(), c.getAuthTag()]);
}
function confere(chave, verificadorB64) {
  const v = Buffer.from(verificadorB64, 'base64');
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', chave, v.subarray(0, 12));
    d.setAuthTag(v.subarray(v.length - 16));
    return Buffer.concat([d.update(v.subarray(12, v.length - 16)), d.final()]).toString() === 'MUSIQUE-OK';
  } catch (_) { return false; }
}

let indice, chave;
if (fs.existsSync(INDICE)) {
  indice = JSON.parse(fs.readFileSync(INDICE, 'utf8'));
  chave = chaveDe(Buffer.from(indice.sal, 'base64'));
  if (!confere(chave, indice.verificador)) falha('a senha não confere com a dos downloads já publicados. Nada foi alterado.');
} else {
  if (fs.existsSync(ANTIGO)) {
    const a = JSON.parse(fs.readFileSync(ANTIGO, 'utf8'));
    if (!confere(crypto.pbkdf2Sync(senha, Buffer.from(a.sal, 'base64'), a.voltas, 32, 'sha256'), a.verificador))
      falha('a senha não confere com a da página de teste. Nada foi alterado.');
  }
  const sal = crypto.randomBytes(16);
  chave = chaveDe(sal);
  indice = { sal: sal.toString('base64'), voltas: VOLTAS, verificador: cifrar(chave, Buffer.from('MUSIQUE-OK')).toString('base64'), programas: {} };
}

fs.mkdirSync(SAIDA, { recursive: true });
const prog = indice.programas[programa] || (indice.programas[programa] = { versao: '', data: '', arquivos: {} });
for (const e of entradas) {
  const dados = fs.readFileSync(e.arquivo);
  const antigo = prog.arquivos[e.sistema];
  const bin = `${programa}-${e.sistema}-${crypto.randomBytes(4).toString('hex')}.bin`;
  fs.writeFileSync(path.join(SAIDA, bin), cifrar(chave, dados));
  if (antigo && antigo.bin && fs.existsSync(path.join(SAIDA, antigo.bin))) fs.unlinkSync(path.join(SAIDA, antigo.bin));
  prog.arquivos[e.sistema] = {
    nome: path.basename(e.arquivo), bin, bytes: dados.length,
    sha256: crypto.createHash('sha256').update(dados).digest('hex')
  };
  console.log(`${programa} · ${e.sistema}: ${path.basename(e.arquivo)} → downloads/arquivos/${bin} (${(dados.length / 1e6).toFixed(1)} MB)`);
}
prog.versao = versao;
prog.data = new Date().toISOString().slice(0, 10);
fs.writeFileSync(INDICE, JSON.stringify(indice, null, 2) + '\n');
console.log('Índice atualizado: downloads/indice.json');
