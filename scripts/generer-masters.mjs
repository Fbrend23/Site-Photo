#!/usr/bin/env node
/**
 * generer-masters.mjs — one-shot : produit les masters web (~3000 px, JPEG q85)
 * à partir des exports pleine résolution.
 *
 * Sert à peupler masters/galerie/ en local pour la mesure d'encodage, puis
 * ~/masters/galerie/ sur Infomaniak (upload par rsync). La même logique de
 * redimensionnement sera reprise par ajouter-photo.mjs.
 *
 * Usage : node scripts/generer-masters.mjs [--force] [dossier-source]
 *         (source par défaut : src/img/galerie/ — les JPG uniquement)
 */

import { mkdir, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const FORCE = process.argv.includes('--force')
const SOURCE_DIR = args[0] ? path.resolve(args[0]) : path.join(ROOT, 'src', 'img', 'galerie')
const MASTERS_DIR = process.env.MASTERS_DIR ?? path.join(ROOT, 'masters', 'galerie')

const COTE_MAX = 3000 // plus grand côté
const QUALITE = 85

if (!existsSync(SOURCE_DIR)) {
  console.error(`Dossier source introuvable : ${SOURCE_DIR}`)
  process.exit(1)
}
await mkdir(MASTERS_DIR, { recursive: true })

const sources = (await readdir(SOURCE_DIR))
  .filter((f) => ['.jpg', '.jpeg'].includes(path.extname(f).toLowerCase()))
  .sort()
if (sources.length === 0) {
  console.error(`Aucun JPG dans ${SOURCE_DIR} — rien à faire.`)
  process.exit(1)
}

let produits = 0
let ignores = 0
let poidsAvant = 0
let poidsApres = 0
const erreurs = []

for (const nom of sources) {
  const source = path.join(SOURCE_DIR, nom)
  const cible = path.join(MASTERS_DIR, `${path.parse(nom).name}.jpg`)
  if (!FORCE && existsSync(cible)) {
    ignores++
    continue
  }
  try {
    const infos = await stat(source)
    if (infos.size === 0) throw new Error('fichier de 0 octet')
    await sharp(source)
      .rotate()
      .resize({ width: COTE_MAX, height: COTE_MAX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITE, mozjpeg: true })
      .toFile(cible)
    poidsAvant += infos.size
    poidsApres += (await stat(cible)).size
    produits++
  } catch (e) {
    erreurs.push(`  ${nom} — ${e.message}`)
  }
}

const Mo = (o) => (o / 1024 / 1024).toFixed(1)
console.log(`Masters produits : ${produits} · déjà présents : ${ignores}`)
if (produits > 0) console.log(`Poids : ${Mo(poidsAvant)} Mo → ${Mo(poidsApres)} Mo`)
if (erreurs.length > 0) {
  console.error(`${erreurs.length} fichier(s) en erreur :\n${erreurs.join('\n')}`)
  process.exit(1)
}
