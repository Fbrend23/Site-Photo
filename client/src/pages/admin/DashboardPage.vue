<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '../../stores/gallery'
import type { Photo } from '../../types/photo'

const store = useGalleryStore()

const editablePhotos = ref<Record<string, { description: string; category: string }>>({})

const categories = ['mammal', 'bird', 'insect', 'reptile', 'paysage', 'uncategorized']

onMounted(async () => {
  if (store.photos.length === 0) {
    await store.fetchPhotos()
  }
  initEditable()
})

function initEditable() {
  store.photos.forEach((photo: Photo) => {
    editablePhotos.value[photo.id] = {
      description: photo.description,
      category: photo.category,
    }
  })
}

async function savePhoto(id: string) {
  const data = editablePhotos.value[id]
  if (data) {
    await store.updatePhoto(id, data)
  }
}

async function removePhoto(id: string) {
  if (confirm('Supprimer cette image ?')) {
    await store.deletePhoto(id)
    delete editablePhotos.value[id]
  }
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

    <h1>Tableau de bord</h1>

    <p v-if="store.photos.length === 0">Aucune image dans la galerie.</p>

    <table v-else>
      <thead>
        <tr>
          <th>Image</th>
          <th>Description</th>
          <th>Cat&eacute;gorie</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="photo in store.photos" :key="photo.id">
          <td>
            <img :src="'/uploads/galerie/' + photo.filename" alt="img">
          </td>
          <td>
            <input
              v-if="editablePhotos[photo.id]"
              v-model="editablePhotos[photo.id].description"
              type="text"
            >
          </td>
          <td>
            <select
              v-if="editablePhotos[photo.id]"
              v-model="editablePhotos[photo.id].category"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
              </option>
            </select>
          </td>
          <td class="actions">
            <button @click="savePhoto(photo.id)">Enregistrer</button>
            <button class="delete-btn" @click="removePhoto(photo.id)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background-color: #1e1e1e;
}

th,
td {
  border: 1px solid #333;
  padding: 0.8rem;
  text-align: left;
  vertical-align: middle;
}

th {
  background-color: #222;
  font-family: sans-serif;
}

td img {
  max-width: 100px;
  height: auto;
  border-radius: 5px;
}

input[type="text"],
select {
  width: 100%;
  padding: 0.4rem;
  border: none;
  border-radius: 4px;
  margin-top: 0.2rem;
  background-color: #f0f0f0;
  color: #000;
  box-sizing: border-box;
  font-family: sans-serif;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

button {
  background-color: #7ecfff;
  color: #000;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-family: sans-serif;
}

button:hover {
  background-color: #5dbbe9;
}

.delete-btn {
  background-color: #ff6b6b;
}

.delete-btn:hover {
  background-color: #ee5a5a;
}

@media (max-width: 768px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: 1rem;
  }

  td {
    position: relative;
    padding-left: 50%;
  }

  .actions {
    flex-direction: row;
  }
}
</style>
