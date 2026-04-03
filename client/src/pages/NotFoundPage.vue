<template>
  <article class="flex flex-col items-center justify-center w-4/5 mx-auto mt-40">
    <h1 class="text-4xl mb-8">404 - Page non trouv&eacute;e</h1>
    <router-link to="/accueil" class="but1">Retour &agrave; l'accueil</router-link>
  </article>
</template>

<style scoped>
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
  color: #eeeeee;
}

.but1:hover {
  background-color: #3da9fc;
  color: black;
  transform: translateY(-2px);
}
</style>
