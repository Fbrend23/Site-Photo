<script setup lang="ts">
import type { Photo } from '../types/photo'

defineProps<{
  photos: Photo[]
}>()

defineEmits<{
  'photo-click': [index: number]
}>()
</script>

<template>
  <div class="portfolio flex flex-wrap justify-center items-center mt-5">
    <div v-for="(photo, index) in photos" :key="photo.id" class="container-img">
      <picture>
        <source :srcset="'/uploads/galerie/' + photo.filename" type="image/webp">
        <img
          :src="'/uploads/galerie/' + photo.filename"
          loading="lazy"
          :alt="photo.description"
          @click="$emit('photo-click', index)"
        >
      </picture>
      <div class="description">{{ photo.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.container-img {
  transition: all 0.5s;
  opacity: 1;
  position: relative;
  margin: 4px;
}

.container-img img {
  background-color: black;
  width: 50svh;
  height: auto;
  cursor: pointer;
}

.description {
  position: absolute;
  bottom: 4px;
  width: 100%;
  text-align: center;
  font-size: 1.5rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.8)
  );
  color: #eee;
  padding: 10px 0;
  opacity: 0;
  transition: opacity 0.8s;
}

.container-img:hover .description {
  opacity: 1;
}

@media (max-width: 768px) {
  .container-img img {
    width: 20svh;
  }

  .description {
    display: none;
  }
}
</style>
