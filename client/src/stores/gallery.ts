import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Photo } from '../types/photo'

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref<Photo[]>([])
  const activeFilter = ref('all')
  const isLoading = ref(false)

  const filteredPhotos = computed(() => {
    if (activeFilter.value === 'all') {
      return photos.value
    }
    return photos.value.filter((photo) => photo.category === activeFilter.value)
  })

  async function fetchPhotos() {
    isLoading.value = true
    try {
      const response = await fetch('/api/photos')
      const data = await response.json()
      photos.value = data.photos
    } catch (error) {
      console.error('Failed to fetch photos:', error)
    } finally {
      isLoading.value = false
    }
  }

  function setFilter(category: string) {
    activeFilter.value = category
  }

  async function updatePhoto(id: string, data: { description?: string; category?: string }) {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const index = photos.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          photos.value[index] = { ...photos.value[index], ...data }
        }
      }
    } catch (error) {
      console.error('Failed to update photo:', error)
    }
  }

  async function deletePhoto(id: string) {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        photos.value = photos.value.filter((p) => p.id !== id)
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  async function uploadPhoto(formData: FormData) {
    try {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        await fetchPhotos()
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
    }
  }

  return {
    photos,
    activeFilter,
    isLoading,
    filteredPhotos,
    fetchPhotos,
    setFilter,
    updatePhoto,
    deletePhoto,
    uploadPhoto,
  }
})
