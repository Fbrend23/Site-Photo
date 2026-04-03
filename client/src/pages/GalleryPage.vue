<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import GalleryFilter from '../components/GalleryFilter.vue'
import GalleryGrid from '../components/GalleryGrid.vue'
import GalleryModal from '../components/GalleryModal.vue'

const store = useGalleryStore()

const isModalOpen = ref(false)
const currentIndex = ref(0)

const activeFilter = computed({
  get: () => store.activeFilter,
  set: (val: string) => store.setFilter(val),
})

const filteredPhotos = computed(() => store.filteredPhotos)

onMounted(() => {
  if (store.photos.length === 0) {
    store.fetchPhotos()
  }
})

function openModal(index: number) {
  currentIndex.value = index
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function prevPhoto() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextPhoto() {
  if (currentIndex.value < filteredPhotos.value.length - 1) {
    currentIndex.value++
  }
}
</script>

<template>
  <section>
    <GalleryFilter v-model="activeFilter" />
    <GalleryGrid :photos="filteredPhotos" @photo-click="openModal" />
    <GalleryModal
      :photos="filteredPhotos"
      :currentIndex="currentIndex"
      :isOpen="isModalOpen"
      @close="closeModal"
      @prev="prevPhoto"
      @next="nextPhoto"
    />
  </section>
</template>
