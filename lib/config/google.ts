import { env, validateEnv } from './env'

export function getGoogleCredentials() {
  const {
    google: { clientEmail, privateKey, apiKey }
  } = validateEnv()

  // Private key is already properly formatted from environment variable
  return {
    clientEmail,
    privateKey,
    apiKey
  }
}
