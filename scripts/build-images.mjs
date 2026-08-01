#!/usr/bin/env node
/**
 * build-images.mjs — encodage idempotent des variantes AVIF/WebP.
 *
 * Cache indexé sur (sha256 du master, hash du profil d'encodage) : une variante
 * n'est encodée qu'une seule fois dans la vie du projet, et changer un réglage
 * du PROFILE invalide proprement tout le cache.
 *
 * Entrée   : masters/galerie/            (surchargeable via MASTERS_DIR)
 * Cache    : .cache/images/<sha256>-<profil>-w<W>.<fmt>
 * Sortie   : public/images/galerie/<stem>.<hash12>.w<W>.<fmt>  (nom immuable)
 * Manifest : app/assets/generated/images-manifest.json
 *
 * Un fichier de 0 octet ou illisible fait échouer le script (exit 1) : la CI
 * doit échouer avant tout déploiement.
 */

import { createHash } from 'node:crypto'
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// ---------------------------------------------------------------------------
// Profil d'encodage — toute modification ici invalide le cache (voulu).
// ---------------------------------------------------------------------------
const PROFILE = {
  avif: { quality: 55, effort: 3 },
  webp: { quality: 80 },
  widths: {
    grille: [400, 800, 1200],
    modale: [1600],
  },
  // Largeurs doublées en WebP pour les navigateurs sans AVIF :
  // 800 en secours de grille, 1600 en secours de modale.
  webpFallback: [800, 1600],
}

const VARIANTES = [
  ...[...PROFILE.widths.grille, ...PROFILE.widths.modale].map((w) => ({ w, fmt: 'avif' })),
  ...PROFILE.webpFallback.map((w) => ({ w, fmt: 'webp' })),
]

const profileHash = createHash('sha256').update(JSON.stringify(PROFILE)).digest('hex').slice(0, 8)

// ---------------------------------------------------------------------------
// Chemins
// ---------------------------------------------------------------------------
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MASTERS_DIR = process.env.MASTERS_DIR ?? path.join(ROOT, 'masters', 'galerie')
const CACHE_DIR = path.join(ROOT, '.cache', 'images')
const PUBLIC_DIR = path.join(ROOT, 'public', 'images', 'galerie')
const MANIFEST_FILE = path.join(ROOT, 'app', 'assets', 'generated', 'images-manifest.json')
const URL_PREFIX = '/images/galerie'

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])

const concurrencyArg = process.argv.find((a) => a.startsWith('--concurrency='))
const CONCURRENCY = concurrencyArg
  ? Math.max(1, Number(concurrencyArg.split('=')[1]))
  : Math.min(4, availableParallelism())

// ---------------------------------------------------------------------------
// 1 · Inventaire et validation des masters
// ---------------------------------------------------------------------------
async function listerMasters() {
  if (!existsSync(MASTERS_DIR)) {
    console.error(`Dossier des masters introuvable : ${MASTERS_DIR}`)
    console.error('En CI : le rsync des masters doit précéder ce script.')
    console.error('En local : `pnpm masters` génère des masters depuis src/img/galerie/.')
    process.exit(1)
  }
  const fichiers = (await readdir(MASTERS_DIR))
    .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort()
  if (fichiers.length === 0) {
    console.error(`Aucune image dans ${MASTERS_DIR} — rien à encoder, abandon.`)
    process.exit(1)
  }
  return fichiers
}

/** Lit, hashe et valide un master. Retourne { nom, buffer, hash, largeur, hauteur, poids }. */
async function chargerMaster(nom) {
  const chemin = path.join(MASTERS_DIR, nom)
  const infos = await stat(chemin)
  if (infos.size === 0) throw new Error('fichier de 0 octet')
  const buffer = await readFile(chemin)
  let meta
  try {
    meta = await sharp(buffer).metadata()
  } catch (e) {
    throw new Error(`illisible par sharp (${e.message})`)
  }
  if (!meta.width || !meta.height) throw new Error('dimensions introuvables')
  // Orientation EXIF 5-8 : largeur et hauteur affichées sont inversées.
  const pivote = (meta.orientation ?? 1) >= 5
  return {
    nom,
    buffer,
    hash: createHash('sha256').update(buffer).digest('hex'),
    largeur: pivote ? meta.height : meta.width,
    hauteur: pivote ? meta.width : meta.height,
    poids: infos.size,
  }
}

// ---------------------------------------------------------------------------
// 2 · Encodage (seul le neuf est encodé)
// ---------------------------------------------------------------------------
/** Encode une variante manquante dans le cache. Retourne la durée en ms, ou null si déjà en cache. */
async function encoderVariante(master, { w, fmt }) {
  const sortie = path.join(CACHE_DIR, `${master.hash}-${profileHash}-w${w}.${fmt}`)
  if (existsSync(sortie)) return null

  const debut = performance.now()
  const pipeline = sharp(master.buffer)
    .rotate() // applique l'orientation EXIF
    .resize({ width: w, withoutEnlargement: true })
  const tmp = `${sortie}.tmp`
  if (fmt === 'avif') await pipeline.avif(PROFILE.avif).toFile(tmp)
  else await pipeline.webp(PROFILE.webp).toFile(tmp)
  await rename(tmp, sortie) // écriture atomique : pas d'entrée tronquée en cache
  return performance.now() - debut
}

// ---------------------------------------------------------------------------
// 3 · Publication + manifest
// ---------------------------------------------------------------------------
async function publier(masters) {
  await mkdir(PUBLIC_DIR, { recursive: true })
  const attendus = new Set()
  const manifest = {}

  for (const master of masters) {
    const stem = path.parse(master.nom).name
    const variantes = []
    for (const { w, fmt } of VARIANTES) {
      const enCache = path.join(CACHE_DIR, `${master.hash}-${profileHash}-w${w}.${fmt}`)
      const nomPublic = `${stem}.${master.hash.slice(0, 12)}.w${w}.${fmt}`
      const cheminPublic = path.join(PUBLIC_DIR, nomPublic)
      attendus.add(nomPublic)
      if (!existsSync(cheminPublic)) await copyFile(enCache, cheminPublic)
      variantes.push({
        format: fmt,
        largeur: Math.min(w, master.largeur), // withoutEnlargement : jamais agrandi
        fichier: `${URL_PREFIX}/${nomPublic}`,
        poids: (await stat(enCache)).size,
      })
    }
    manifest[master.nom] = {
      hash: master.hash.slice(0, 12),
      largeur: master.largeur,
      hauteur: master.hauteur,
      variantes,
    }
  }

  // Purge des orphelins : le dossier public est entièrement dérivé du cache.
  for (const f of await readdir(PUBLIC_DIR)) {
    if (!attendus.has(f)) await rm(path.join(PUBLIC_DIR, f))
  }

  await mkdir(path.dirname(MANIFEST_FILE), { recursive: true })
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2))
  return manifest
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------
const departMur = performance.now()
await mkdir(CACHE_DIR, { recursive: true })

const noms = await listerMasters()
const masters = []
const invalides = []
for (const nom of noms) {
  try {
    masters.push(await chargerMaster(nom))
  } catch (e) {
    invalides.push(`  ${nom} — ${e.message}`)
  }
}
if (invalides.length > 0) {
  console.error(`${invalides.length} master(s) invalide(s) :`)
  console.error(invalides.join('\n'))
  console.error('Corriger ou retirer ces fichiers — abandon avant tout déploiement.')
  process.exit(1)
}

// File de travail : un master à la fois par worker, variantes en séquence
// (le pool parallélise entre masters, les durées par variante restent lisibles).
let encodees = 0
let depuisCache = 0
let dureeEncodage = 0
const parFormat = { avif: { n: 0, ms: 0 }, webp: { n: 0, ms: 0 } }
const file = [...masters]

async function worker() {
  let master
  while ((master = file.shift()) !== undefined) {
    for (const variante of VARIANTES) {
      const duree = await encoderVariante(master, variante)
      if (duree === null) {
        depuisCache++
      } else {
        encodees++
        dureeEncodage += duree
        parFormat[variante.fmt].n++
        parFormat[variante.fmt].ms += duree
      }
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const manifest = await publier(masters)

// ---------------------------------------------------------------------------
// Statistiques — la mesure qui conditionne les réglages du PROFILE
// ---------------------------------------------------------------------------
const dureeMur = (performance.now() - departMur) / 1000
const poidsMasters = masters.reduce((s, m) => s + m.poids, 0)
const poidsParFormat = { avif: 0, webp: 0 }
for (const entree of Object.values(manifest)) {
  for (const v of entree.variantes) poidsParFormat[v.format] += v.poids
}
const Mo = (o) => (o / 1024 / 1024).toFixed(1)

console.log(`\nProfil ${profileHash} · ${masters.length} masters · ${VARIANTES.length} variantes/master · concurrence ${CONCURRENCY}`)
console.log(`Encodées : ${encodees} · depuis le cache : ${depuisCache}`)
if (encodees > 0) {
  console.log(`Temps d'encodage cumulé : ${(dureeEncodage / 1000).toFixed(1)} s · moyenne ${(dureeEncodage / encodees / 1000).toFixed(2)} s/variante`)
  for (const [fmt, s] of Object.entries(parFormat)) {
    if (s.n > 0) console.log(`  ${fmt} : ${s.n} variantes, moyenne ${(s.ms / s.n / 1000).toFixed(2)} s`)
  }
}
console.log(`Poids : masters ${Mo(poidsMasters)} Mo → avif ${Mo(poidsParFormat.avif)} Mo + webp ${Mo(poidsParFormat.webp)} Mo`)
console.log(`Temps mur total : ${dureeMur.toFixed(1)} s`)
