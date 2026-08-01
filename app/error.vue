<script setup lang="ts">
const error = useError()
</script>

<template>
  <div class="content">
    <main>
      <h1>{{ error?.statusCode === 404 ? 'Page introuvable' : 'Une erreur est survenue' }}</h1>
      <NuxtLink to="/">Retour à l'accueil</NuxtLink>
    </main>
  </div>
</template>
