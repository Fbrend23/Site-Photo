<script setup lang="ts">
// Manifest produit par scripts/build-images.mjs — exécuter `pnpm images`
// avant tout build. En CI, le workflow s'en charge.
import manifest from '~/assets/generated/images-manifest.json'

interface Variante {
  format: string
  largeur: number
  fichier: string
  poids: number
}
interface EntreeManifest {
  hash: string
  largeur: number
  hauteur: number
  variantes: Variante[]
}

const images = manifest as Record<string, EntreeManifest>

useSeoMeta({
  title: 'Galerie',
  description: 'Galerie de photographies animalières — oiseaux, mammifères, insectes.',
})

const { data: photos } = await useAsyncData('photos', () => queryCollection('photos').all())

// ------- Filtres par catégorie (port de l'ancien galerie.js) -------

const categories = [
  { filtre: 'all', libelle: 'Tous' },
  { filtre: 'mammal', libelle: 'Mammifères' },
  { filtre: 'bird', libelle: 'Oiseaux' },
  { filtre: 'insect', libelle: 'Insectes' },
  { filtre: 'reptile', libelle: 'Reptiles' },
  { filtre: 'paysage', libelle: 'Paysages' },
] as const

const filtreActif = ref<string>('all')

function estVisible(photo: { categorie: string }) {
  return filtreActif.value === 'all' || photo.categorie === filtreActif.value
}

// La liste filtrée sert aussi de séquence de navigation dans la modale.
const photosVisibles = computed(() => (photos.value ?? []).filter(estVisible))

// ------- Variantes -------

// srcset de grille : largeurs ≤ 1200, la 1600 est réservée à la modale.
function srcsetGrille(entree: EntreeManifest, format: string) {
  return entree.variantes
    .filter((v) => v.format === format && v.largeur <= 1200)
    .map((v) => `${v.fichier} ${v.largeur}w`)
    .join(', ')
}

function secoursWebp(entree: EntreeManifest) {
  return entree.variantes.find((v) => v.format === 'webp')?.fichier
}

function variante(entree: EntreeManifest, format: string, largeur: number) {
  return entree.variantes.find((v) => v.format === format && v.largeur === largeur)?.fichier
}

// ------- Modale plein écran -------

const indexModale = ref<number | null>(null)
const imageChargee = ref(false)

const photoModale = computed(() =>
  indexModale.value === null ? null : (photosVisibles.value[indexModale.value] ?? null),
)

function ouvrirModale(index: number) {
  indexModale.value = index
  imageChargee.value = false
}

function fermerModale() {
  indexModale.value = null
}

function precedente() {
  if (indexModale.value !== null && indexModale.value > 0) {
    indexModale.value--
    imageChargee.value = false
  }
}

function suivante() {
  if (indexModale.value !== null && indexModale.value < photosVisibles.value.length - 1) {
    indexModale.value++
    imageChargee.value = false
  }
}

function toucheClavier(e: KeyboardEvent) {
  if (indexModale.value === null) return
  if (e.key === 'Escape') fermerModale()
  else if (e.key === 'ArrowLeft') precedente()
  else if (e.key === 'ArrowRight') suivante()
}

onMounted(() => window.addEventListener('keydown', toucheClavier))
onUnmounted(() => window.removeEventListener('keydown', toucheClavier))
</script>

<template>
  <section>
    <div id="category">
      <button
        v-for="cat in categories"
        :key="cat.filtre"
        class="btn"
        :class="[cat.filtre, { selected: filtreActif === cat.filtre }]"
        @click="filtreActif = cat.filtre"
      >
        {{ cat.libelle }}
      </button>
    </div>

    <div class="portfolio">
      <template v-for="photo in photos" :key="photo.master">
        <div
          v-if="images[photo.master]"
          class="container-img item"
          :class="[photo.categorie, { hidden: !estVisible(photo) }]"
        >
          <picture>
            <source
              type="image/avif"
              :srcset="srcsetGrille(images[photo.master]!, 'avif')"
              sizes="(max-width: 768px) 50vw, 20vw"
            >
            <img
              :src="secoursWebp(images[photo.master]!)"
              :width="images[photo.master]!.largeur"
              :height="images[photo.master]!.hauteur"
              :alt="photo.description"
              loading="lazy"
              @click="ouvrirModale(photosVisibles.indexOf(photo))"
            >
          </picture>
          <div class="description">{{ photo.description }}</div>
        </div>
        <p v-else class="image-manquante">Master absent : {{ photo.master }}</p>
      </template>
    </div>

    <!-- Modale plein écran : variante 1600 px, AVIF avec secours WebP -->
    <div v-if="photoModale && images[photoModale.master]" class="modal" @click.self="fermerModale">
      <span class="close" @click="fermerModale">&times;</span>
      <picture>
        <source
          type="image/avif"
          :srcset="variante(images[photoModale.master]!, 'avif', 1600)"
        >
        <img
          :key="photoModale.master"
          class="modal-content"
          :class="{ loaded: imageChargee }"
          :src="variante(images[photoModale.master]!, 'webp', 1600)"
          :alt="photoModale.description"
          @load="imageChargee = true"
        >
      </picture>
      <div class="caption">{{ photoModale.description }}</div>
      <a v-if="indexModale! > 0" class="previous" @click="precedente">&#10094;</a>
      <a v-if="indexModale! < photosVisibles.length - 1" class="next" @click="suivante">&#10095;</a>
      <div v-if="!imageChargee" class="loader" />
    </div>
  </section>
</template>
