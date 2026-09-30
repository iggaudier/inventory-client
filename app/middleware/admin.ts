export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (!user.value) {
    return navigateTo('/auth/login')
  }

  if (user.value.role !== 'super-admin') {
    return navigateTo('/client/dashboard')
  }
})