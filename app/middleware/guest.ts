export default defineNuxtRouteMiddleware(async () => {
  const { user, isLoggedIn, fetchUser } = useAuth()
  const token = useCookie('auth_token')

  if (!user.value && token.value) {
    await fetchUser()
  }

  if (isLoggedIn.value) {
    return navigateTo('/client/dashboard')
  }
})