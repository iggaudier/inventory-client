export const useAuth = () => {
  const user = useState<any>('user', () => null)
  const api = useApi()

  const setUser = (userData: any) => {
    user.value = userData
  }

  const fetchUser = async () => {
    const token = useCookie('auth_token')
    if (!token.value) {
      user.value = null
      return
    }
    try {
      user.value = await api('/me')
    } catch {
      user.value = null
      token.value = null
    }
  }

  const logout = async () => {
    const token = useCookie('auth_token')
    try {
      await api('/logout', { method: 'POST' })
    } catch {
      //
    } finally {
      token.value = null
      user.value = null
    }
  }

  const isLoggedIn = computed(() => !!user.value)

  return { user, setUser, fetchUser, logout, isLoggedIn }
}