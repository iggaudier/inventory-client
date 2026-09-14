export const useApi = () => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: `${config.public.apiBase}`,
    credentials: 'include',
    onRequest({ options }) {
      const token = useCookie('auth_token')

      if (token.value) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token.value}`)
        options.headers = headers
      }
    },
  })

  return api
}