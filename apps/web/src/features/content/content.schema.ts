import { z } from 'zod'

const webUrl = z.url().refine((value) => /^https?:\/\//.test(value), 'Use an HTTP or HTTPS URL')
const common = {
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  draft: z.boolean().default(true),
}
export const postSchema = z.object({
  ...common,
  date: z.iso.date(),
})
export const projectSchema = z.object({
  ...common,
  technologies: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  source: webUrl.optional(),
  demo: webUrl.optional(),
})
export type ContentMeta =
  | (z.infer<typeof postSchema> & { kind: 'blog'; slug: string; path: string })
  | (z.infer<typeof projectSchema> & { kind: 'projects'; slug: string; path: string })
