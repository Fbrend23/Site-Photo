<script setup lang="ts">
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

// Fond d'écran du site : DSC01060 n'est pas une photo de la galerie mais
// l'arrière-plan historique (body::before dans le CSS). On référence sa
// variante encodée — l'URL contient un hash de contenu, donc jamais en dur.
const images = manifest as Record<string, EntreeManifest>
const fond = images['DSC01060.jpg']?.variantes.find(
  (v) => v.format === 'webp' && v.largeur === 1600,
)?.fichier

useHead({
  htmlAttrs: {
    lang: 'fr',
    style: fond ? `--image-fond: url('${fond}')` : undefined,
  },
  link: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }],
})

// Menu hamburger mobile — port de l'ancien index.js en état réactif.
const menuOuvert = ref(false)

// En SPA la page ne se recharge pas : on referme le menu à chaque navigation.
const route = useRoute()
watch(() => route.path, () => {
  menuOuvert.value = false
})
</script>

<template>
  <div class="content" :class="{ click: menuOuvert }">
    <header class="site-header">
      <NuxtLink to="/" aria-label="Accueil"><img class="logo mobile" src="/logo.png" alt="logo"></NuxtLink>
      <div class="nav-container" :class="{ mobile: menuOuvert }">
        <nav class="navigation" :class="{ mobile: menuOuvert }">
          <ul class="main-list" :class="{ mobile: menuOuvert }">
            <li><NuxtLink to="/">Accueil</NuxtLink></li>
            <li><NuxtLink to="/galerie">Galerie</NuxtLink></li>
            <li>
              <a class="contact" href="https://contact.brendanfleurdelys.ch/index.php?origin=photo">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
      <div id="hamburger" :class="{ click: menuOuvert }" @click="menuOuvert = !menuOuvert">
        <div class="bar1" :class="{ click: menuOuvert }" />
        <div class="bar2" :class="{ click: menuOuvert }" />
        <div class="bar3" :class="{ click: menuOuvert }" />
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer>
      <div class="footer-links">
        <p>© 2026 Brendan Fleurdelys</p>
        <NuxtLink to="/mentions-legales">Mentions légales</NuxtLink>
      </div>
    </footer>
  </div>
</template>
