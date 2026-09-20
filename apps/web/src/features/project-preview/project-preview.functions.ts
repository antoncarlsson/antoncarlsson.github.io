import { createServerFn } from '@tanstack/react-start'
import { reportUnexpectedError } from '../../server/error-handler'
import { projectPreviewSchema } from './project-preview.schema'
import { createProjectPreview } from './project-preview.service'

export const previewProject = createServerFn({ method: 'POST' })
  .validator(projectPreviewSchema)
  .handler(({ data }) => {
    try {
      return createProjectPreview(data)
    } catch (error) {
      const reference = reportUnexpectedError(error)
      throw new Error(`Unable to preview this project. Reference: ${reference}`)
    }
  })
