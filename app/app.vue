<script setup lang="ts">
useHead({ htmlAttrs: { lang: 'fr' } })
</script>

<template>
  <div class="content">
    <header class="site-header">
      <div class="nav-container">
        <nav class="navigation">
          <ul class="main-list">
            <li><NuxtLink to="/">Accueil</NuxtLink></li>
            <li><NuxtLink to="/galerie">Galerie</NuxtLink></li>
            <li>
              <a class="contact" href="https://contact.brendanfleurdelys.ch/index.php?origin=photo">Contact</a>
            </li>
          </ul>
        </nav>
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
