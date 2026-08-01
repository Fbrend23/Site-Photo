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

// srcset de grille : largeurs ≤ 1200, la 1600 est réservée à la modale (phase 2)
function srcsetGrille(entree: EntreeManifest, format: string) {
  return entree.variantes
    .filter((v) => v.format === format && v.largeur <= 1200)
    .map((v) => `${v.fichier} ${v.largeur}w`)
    .join(', ')
}

function secoursWebp(entree: EntreeManifest) {
  return entree.variantes.find((v) => v.format === 'webp')?.fichier
}
</script>

<template>
  <section class="galerie">
    <h1>Galerie</h1>
    <div class="grille">
      <figure v-for="photo in photos" :key="photo.master">
        <picture v-if="images[photo.master]">
          <source
            type="image/avif"
            :srcset="srcsetGrille(images[photo.master]!, 'avif')"
            sizes="(max-width: 600px) 100vw, 33vw"
          >
          <img
            :src="secoursWebp(images[photo.master]!)"
            :width="images[photo.master]!.largeur"
            :height="images[photo.master]!.hauteur"
            :alt="photo.description"
            loading="lazy"
          >
        </picture>
        <p v-else class="image-manquante">Master absent : {{ photo.master }}</p>
        <figcaption>
          {{ photo.description }}<template v-if="photo.lieu"> — {{ photo.lieu }}</template>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
