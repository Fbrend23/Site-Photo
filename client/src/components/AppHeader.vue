<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

watch(
  () => route.path,
  () => {
    menuOpen.value = false
  }
)
</script>

<template>
  <header class="site-header flex justify-between items-center px-6 mt-1">
    <a href="https://brendanfleurdelys.ch">
      <img class="logo mobile w-[50px] cursor-pointer mr-2.5" src="/logo.png" alt="logo">
    </a>
    <div class="nav-container" :class="{ mobile: menuOpen }">
      <nav class="navigation" :class="{ mobile: menuOpen }">
        <ul class="main-list" :class="{ mobile: menuOpen }">
          <li><router-link to="/accueil" active-class="active">Accueil</router-link></li>
          <li><router-link to="/galerie" active-class="active">Galerie</router-link></li>
          <li><a href="https://contact.brendanfleurdelys.ch/index.php?origin=photo" class="contact">Contact</a></li>
        </ul>
      </nav>
    </div>
    <div id="hamburger" @click="toggleMenu">
      <div class="bar1" :class="{ click: menuOpen }"></div>
      <div class="bar2" :class="{ click: menuOpen }"></div>
      <div class="bar3" :class="{ click: menuOpen }"></div>
    </div>
  </header>
</template>

<style scoped>
.main-list li {
  display: inline-block;
  margin: 0 10px;
}

.main-list li a {
  font-size: 1.25rem;
  transition: all 500ms;
  text-decoration: none;
  color: var(--site-white);
}

.main-list li a:hover {
  font-size: 1.8em;
  color: #3da9fc;
}

.main-list li a.active {
  text-decoration: underline;
  color: #1fa0cc;
}

#hamburger {
  display: none;
  cursor: pointer;
  z-index: 200;
}

#hamburger div {
  width: 30px;
  height: 3px;
  background-color: var(--site-white);
  margin: 6px 0;
  transition: all 0.4s ease;
}

.bar1.click {
  transform: translateY(9px) rotate(-45deg);
}

.bar2.click {
  opacity: 0;
}

.bar3.click {
  transform: translateY(-9px) rotate(45deg);
}

.nav-container.mobile {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-list.mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  margin-top: 100px;
}

.main-list.mobile li {
  display: block;
}

.main-list.mobile li a {
  font-size: 2rem;
}

@media (max-width: 768px) {
  #hamburger {
    display: block;
  }

  .nav-container:not(.mobile) {
    display: none;
  }
}
</style>
