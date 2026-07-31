export default defineNuxtRouteMiddleware(async () => {
  const { user, isLoggedIn, fetchUser } = useAuth()
  const token = useCookie('auth_token')

  // If we have a token but haven't resolved the user yet (e.g. the auth
  // plugin hasn't finished, or this is a fresh SSR request), try once
  // before deciding to redirect. This covers the case where the plugin's
  // fetchUser() call hasn't completed by the time middleware runs.
  if (!user.value && token.value) {
    await fetchUser()
  }

  if (!isLoggedIn.value) {
    return navigateTo('/auth/login')
  }
})