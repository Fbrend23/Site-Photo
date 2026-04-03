<script setup lang="ts">
import { ref, onMounted } from 'vue'

const intro1Visible = ref(false)
const intro2Visible = ref(false)

onMounted(() => {
  setTimeout(() => {
    intro1Visible.value = true
  }, 1000)
  setTimeout(() => {
    intro2Visible.value = true
  }, 2000)
})
</script>

<template>
  <article class="main-page flex flex-col flex-wrap justify-center items-center w-4/5 mx-auto mt-40">
    <h2 class="intro1" :style="{ opacity: intro1Visible ? 1 : 0 }">Brendan Fleurdelys</h2>
    <h1 class="intro1" :style="{ opacity: intro1Visible ? 1 : 0 }">Photographe amateur</h1>
    <router-link to="/galerie" class="but1 intro2" :style="{ opacity: intro2Visible ? 1 : 0 }">Voir la galerie</router-link>
  </article>
</template>

<style scoped>
h2 {
  border-bottom: rgba(255, 255, 255, 0.6) solid 1px;
  padding-bottom: 1.25rem;
  font-size: 4rem;
  min-width: 40%;
  text-align: center;
  transition: all 2s;
}

h1 {
  margin: 20px auto 50px;
  color: white;
  font-size: 2rem;
  transition: all 2s;
  text-align: center;
}

.but1 {
  background-color: transparent;
  border: 2px solid #3da9fc;
  padding: 10px 20px;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: all 0.3s;
  text-decoration: none;
  color: var(--site-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.but1:hover {
  background-color: #3da9fc;
  color: black;
  transform: translateY(-2px);
}
</style>
