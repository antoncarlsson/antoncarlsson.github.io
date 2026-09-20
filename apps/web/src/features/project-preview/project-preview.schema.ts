import { z } from 'zod'

export const projectPreviewSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters.')
    .max(60, 'Use at most 60 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters).')
    .max(280, 'Use at most 280 characters.'),
})

export type ProjectPreviewInput = z.infer<typeof projectPreviewSchema>
