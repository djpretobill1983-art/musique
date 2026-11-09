#!/usr/bin/env node
/*
 * Cifra os arquivos da página de teste (teste-mix/) com a senha de acesso.
 * O site é público: sem a senha, o arquivo publicado é só ruído.
 *
 *   node ferramentas/cifrar-download.js "<senha>" <arquivo.apk> [<arquivo2> ...]
 *
 * Gera teste-mix/arquivos/*.bin e teste-mix/arquivos.json. Trocar a senha =
 * rodar de novo com a senha nova e os mesmos arquivos (os .bin antigos saem).
 * Formato de cada .bin: iv (12 bytes) + AES-256-GCM. A chave vem da senha por
 * PBKDF2-SHA256 com o sal e as voltas que ficam no arquivos.json.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const [senha, ...arquivos] = process.argv.slice(2);
if (!senha || !arquivos.length) { console.error('uso: cifrar-download.js "<senha>" <arquivo> [...]'); process.exit(1); }

const PASTA = path.join(__dirname, '..', 'teste-mix');
const SAIDA = path.join(PASTA, 'arquivos');
const VOLTAS = 250000;
const sal = crypto.randomBytes(16);
const chave = crypto.pbkdf2Sync(senha, sal, VOLTAS, 32, 'sha256');

function cifrar(dados) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave, iv);
  return Buffer.concat([iv, c.update(dados), c.final(), c.getAuthTag()]);
}

fs.mkdirSync(SAIDA, { recursive: true });
fs.readdirSync(SAIDA).filter(f => f.endsWith('.bin')).forEach(f => fs.unlinkSync(path.join(SAIDA, f)));

const lista = arquivos.map((a, i) => {
  const dados = fs.readFileSync(a);
  const nome = path.basename(a);
  const bin = `arquivo-${i + 1}-${crypto.randomBytes(4).toString('hex')}.bin`;
  fs.writeFileSync(path.join(SAIDA, bin), cifrar(dados));
  return {
    nome, bin, bytes: dados.length,
    sha256: crypto.createHash('sha256').update(dados).digest('hex'),
    plataforma: /\.apk$/i.test(nome) ? 'android' : /\.exe$/i.test(nome) ? 'windows' : 'outro'
  };
});

const verificador = cifrar(Buffer.from('MUSIQUE-OK')).toString('base64');
fs.writeFileSync(path.join(PASTA, 'arquivos.json'), JSON.stringify({
  gerado: new Date().toISOString().slice(0, 10),
  sal: sal.toString('base64'), voltas: VOLTAS, verificador, arquivos: lista
}, null, 2) + '\n');
lista.forEach(l => console.log(`${l.nome} → arquivos/${l.bin} (${(l.bytes / 1e6).toFixed(1)} MB)`));
