<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [category: string]
}>()

const categories = [
  { value: 'all', label: 'Tous' },
  { value: 'mammal', label: 'Mammif\u00e8res' },
  { value: 'bird', label: 'Oiseaux' },
  { value: 'insect', label: 'Insectes' },
  { value: 'reptile', label: 'Reptiles' },
  { value: 'paysage', label: 'Paysages' },
]
</script>

<template>
  <div class="filter-bar flex flex-wrap justify-center gap-3 mt-20">
    <button
      v-for="cat in categories"
      :key="cat.value"
      class="filter-btn"
      :class="{ selected: modelValue === cat.value }"
      @click="emit('update:modelValue', cat.value)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-btn {
  background-color: transparent;
  border: 2px solid #3da9fc;
  padding: 10px 20px;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s;
  color: #eeeeee;
}

.filter-btn:hover {
  background-color: #3da9fc;
  color: black;
  transform: translateY(-2px);
}

.filter-btn.selected {
  background-color: rgba(0, 146, 204, 0.8);
  font-weight: 700;
}
</style>
