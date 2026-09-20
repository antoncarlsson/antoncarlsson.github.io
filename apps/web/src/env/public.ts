import { parseEnvironment, publicEnvSchema } from './schema'

export const publicEnv = parseEnvironment(publicEnvSchema, {
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
})
