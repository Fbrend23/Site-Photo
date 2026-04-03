<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Photo } from '../types/photo'

const props = defineProps<{
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const imageLoaded = ref(false)

const currentPhoto = computed(() => {
  return props.photos[props.currentIndex] ?? null
})

watch(
  () => props.currentIndex,
  () => {
    imageLoaded.value = false
  }
)

function onImageLoad() {
  imageLoaded.value = true
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.isOpen) return
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') emit('prev')
  if (e.key === 'ArrowRight') emit('next')
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div v-if="isOpen" class="modal" @click.self="$emit('close')">
    <span class="close" @click="$emit('close')">&times;</span>
    <img
      class="modal-content"
      :class="{ loaded: imageLoaded }"
      :src="currentPhoto ? '/uploads/galerie/' + currentPhoto.filename : ''"
      :alt="currentPhoto?.description"
      @load="onImageLoad"
    >
    <a class="previous" @click="$emit('prev')">&#10094;</a>
    <a class="next" @click="$emit('next')">&#10095;</a>
    <div v-if="!imageLoaded" class="loader"></div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
}

.modal-content {
  position: fixed;
  margin: auto;
  height: auto;
  max-width: 80%;
  transition: opacity 0.3s;
  opacity: 0;
}

.modal-content.loaded {
  opacity: 1;
}

.close {
  color: white;
  position: absolute;
  top: 10px;
  right: 40px;
  font-size: 3rem;
  font-family: Georgia, serif;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  user-select: none;
}

.previous,
.next {
  position: absolute;
  top: 50%;
  cursor: pointer;
  font-size: 2.25rem;
  user-select: none;
  font-weight: bold;
  color: white;
}

.next {
  right: 5svh;
}

.previous {
  left: 5svh;
}

.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 6px solid #f3f3f3;
  border-top: 6px solid #555;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 1001;
}

@media (max-width: 768px) {
  .next {
    right: 8svh;
    top: 70%;
  }

  .previous {
    left: 8svh;
    top: 70%;
  }
}
</style>
