<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'

const router = useRouter()
const store = useGalleryStore()

const imageFile = ref<File | null>(null)
const description = ref('')
const category = ref('mammal')
const isUploading = ref(false)

const categories = [
  { value: 'mammal', label: 'Mammifères' },
  { value: 'bird', label: 'Oiseaux' },
  { value: 'insect', label: 'Insectes' },
  { value: 'reptile', label: 'Reptiles' },
  { value: 'paysage', label: 'Paysages' },
]

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  imageFile.value = target.files?.[0] ?? null
}

async function onSubmit() {
  if (!imageFile.value || !description.value) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('image', imageFile.value)
  formData.append('description', description.value)
  formData.append('category', category.value)

  await store.uploadPhoto(formData)
  isUploading.value = false
  router.push('/admin')
}
</script>

<template>
  <div class="admin-page">
    <nav class="admin-nav">
      <strong>Back-Office</strong> |
      <router-link to="/admin">Tableau de bord</router-link> |
      <router-link to="/admin/upload">Ajouter</router-link> |
      <router-link to="/accueil">Retour au site</router-link>
    </nav>

    <h1>Ajouter une photo</h1>

    <form class="upload-form" @submit.prevent="onSubmit">
      <label>
        Image :
        <input type="file" accept="image/jpeg,image/png" required @change="onFileChange">
      </label>

      <label>
        Cat&eacute;gorie :
        <select v-model="category" required>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </label>

      <label>
        Description :
        <input v-model="description" type="text" required>
      </label>

      <button type="submit" :disabled="isUploading">
        {{ isUploading ? 'Envoi en cours...' : 'Envoyer' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.admin-page {
  font-family: sans-serif;
  padding: 2rem;
  background-color: #111;
  color: #fff;
  min-height: 100vh;
}

.admin-nav {
  margin-bottom: 1rem;
  color: #7ecfff;
}

.admin-nav a {
  color: #7ecfff;
  text-decoration: none;
  margin: 0 0.5rem;
  font-family: sans-serif;
}

.admin-nav a:hover {
  text-decoration: underline;
}

h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
  color: #7ecfff;
  font-family: sans-serif;
}

.upload-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

label {
  font-size: 1.5rem;
  font-family: sans-serif;
}

input[type="text"],
select {
  padding: 0.4rem;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #000;
  font-size: 1.2rem;
  font-family: sans-serif;
}

button {
  background-color: #7ecfff;
  color: #000;
  border: none;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1.2rem;
  transition: background-color 0.2s;
  font-family: sans-serif;
}

button:hover {
  background-color: #5dbbe9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
