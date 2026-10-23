export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.apiBase || '').replace(/\/+$/, '')

  if (!baseURL) {
    throw new Error('NUXT_PUBLIC_API_BASE must be configured with the API origin.')
  }

  const api = $fetch.create({
    baseURL,
    // Authentication is supplied by the bearer token below. Omitting
    // credentials makes Vercel-to-DuckDNS requests independent of browsers'
    // third-party cookie rules.
    credentials: 'omit',
    onRequest({ options }) {
      const token = useAuthToken()

      if (token.value) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },
  })

  return api
}
