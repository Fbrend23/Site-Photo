#!/usr/bin/env node
/**
 * ajouter-photo.mjs — publication d'une photo depuis la machine locale.
 *
 * Fait tout ce qui est local : master 3000 px dans masters/galerie/ + fiche
 * YAML dans content/photos/. Affiche ensuite les deux étapes restantes
 * (rsync du master vers Infomaniak, puis commit/push de la fiche) — dans cet
 * ordre : la CI télécharge les masters du serveur, le master doit y être
 * AVANT que la fiche n'arrive sur main.
 *
 * Usage :
 *   pnpm photo:add -- <photo.jpg> --description "Martin-pêcheur d'Europe" \
 *     --categorie bird [--lieu "Suisse romande"] [--date 2026-07-31] [--force]
 */

import { mkdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MASTERS_DIR = process.env.MASTERS_DIR ?? path.join(ROOT, 'masters', 'galerie')
const FICHES_DIR = path.join(ROOT, 'content', 'photos')

// Mêmes réglages que generer-masters.mjs — un master est un master.
const COTE_MAX = 3000
const QUALITE = 85

const CATEGORIES = ['bird', 'mammal', 'insect', 'reptile', 'paysage']

const { values: options, positionals } = parseArgs({
  options: {
    description: { type: 'string' },
    categorie: { type: 'string' },
    lieu: { type: 'string' },
    date: { type: 'string' },
    force: { type: 'boolean', default: false },
  },
  allowPositionals: true,
})

function usage(message) {
  console.error(`Erreur : ${message}\n`)
  console.error(
    `Usage : pnpm photo:add -- <photo.jpg> --description "…" --categorie <${CATEGORIES.join('|')}>`
      + ` [--lieu "…"] [--date AAAA-MM-JJ] [--force]`,
  )
  process.exit(1)
}

const sourceArg = positionals[0]
if (!sourceArg) usage('chemin de la photo manquant')
if (!options.description) usage('--description est obligatoire')
if (!options.categorie) usage('--categorie est obligatoire')
if (!CATEGORIES.includes(options.categorie)) {
  usage(`catégorie « ${options.categorie} » inconnue (attendu : ${CATEGORIES.join(', ')})`)
}
if (options.date && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
  usage(`date « ${options.date} » invalide (attendu : AAAA-MM-JJ)`)
}

const source = path.resolve(sourceArg)
if (!existsSync(source)) usage(`fichier introuvable : ${source}`)
if (!['.jpg', '.jpeg'].includes(path.extname(source).toLowerCase())) {
  usage('seuls les JPG sont acceptés en entrée')
}
if ((await stat(source)).size === 0) usage(`fichier de 0 octet : ${source}`)

const nom = path.parse(source).name
const master = `${nom}.jpg`
const cibleMaster = path.join(MASTERS_DIR, master)
const fiche = path.join(FICHES_DIR, `${nom.toLowerCase()}.yml`)

if (!options.force && existsSync(cibleMaster)) {
  usage(`le master ${master} existe déjà (--force pour l'écraser)`)
}
if (!options.force && existsSync(fiche)) {
  usage(`la fiche ${path.basename(fiche)} existe déjà (--force pour l'écraser)`)
}

// 1 · Master 3000 px
await mkdir(MASTERS_DIR, { recursive: true })
await sharp(source)
  .rotate()
  .resize({ width: COTE_MAX, height: COTE_MAX, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: QUALITE, mozjpeg: true })
  .toFile(cibleMaster)
const poids = (await stat(cibleMaster)).size
console.log(`Master : ${path.relative(ROOT, cibleMaster)} (${(poids / 1024).toFixed(0)} Ko)`)

// 2 · Fiche YAML — l'échappement double les apostrophes du YAML à quotes simples
const quote = (v) => `'${String(v).replaceAll("'", "''")}'`
const lignes = [
  `master: ${master}`,
  `description: ${quote(options.description)}`,
  `categorie: ${options.categorie}`,
]
if (options.lieu) lignes.push(`lieu: ${quote(options.lieu)}`)
if (options.date) lignes.push(`date: ${quote(options.date)}`)
await writeFile(fiche, lignes.join('\n') + '\n', 'utf8')
console.log(`Fiche  : ${path.relative(ROOT, fiche)}`)

// 3 · Ce qui reste à faire, dans l'ordre
console.log(`
Étapes suivantes, dans cet ordre (la CI lit les masters du serveur) :
  1. rsync -az masters/galerie/${master} <user>@<hote>:masters/galerie/
  2. git add ${path.relative(ROOT, fiche).replaceAll('\\', '/')} && git commit && git push
`)
