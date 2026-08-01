<script setup lang="ts">
// Même contenu que / — URL conservée pour les liens existants,
// mais c'est / qui est canonique. Pas de redirection côté client.
const site = useSiteConfig()

useSeoMeta({
  title: 'Accueil',
  description: 'Portfolio de photographie animalière de Brendan Fleurdelys.',
})
useHead({
  link: [{ rel: 'canonical', href: `${site.url}/` }],
})
</script>

<template>
  <AccueilContenu />
</template>
