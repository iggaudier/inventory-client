/**
 * The API uses this value as a bearer token. Keeping the cookie options in one
 * place ensures SSR, client navigation, and logout all address the same cookie.
 */
export const useAuthToken = () => useCookie<string | null>('auth_token', {
  default: () => null,
  maxAge: 60 * 60 * 24,
  path: '/',
  sameSite: 'lax',
  secure: !import.meta.dev,
})
