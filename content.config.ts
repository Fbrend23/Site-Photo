import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    photos: defineCollection({
      type: 'data',
      source: 'photos/*.yml',
      schema: z.object({
        // Nom du fichier master dans ~/masters/galerie/ (ex. DSC00162.jpg)
        master: z.string(),
        description: z.string(),
        categorie: z.enum(['bird', 'mammal', 'insect', 'reptile', 'paysage']),
        lieu: z.string().optional(),
        date: z.string().optional(),
      }),
    }),
  },
})
