export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('auth_token')
  const { user, fetchUser } = useAuth()

  if (token.value && !user.value) {
    await fetchUser()
  }

  if (!user.value) {
    return
  }

  if (user.value.must_change_password && to.path !== '/auth/change-password') {
    return navigateTo('/auth/change-password')
  }

  if (!user.value.must_change_password && to.path === '/auth/change-password') {
    return navigateTo('/client/dashboard')
  }
})
