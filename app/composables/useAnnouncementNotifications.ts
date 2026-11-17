export const useAnnouncementNotifications = () => {
  const api = useApi()
  const user = useState<any>('user')
  const unreadCount = useState('announcementUnreadCount', () => 0)
  const requestVersion = useState('announcementCountRequest', () => 0)

  async function refreshUnreadCount() {
    const version = ++requestVersion.value
    const userId = user.value?.id
    if (!userId) { unreadCount.value = 0; return }

    try {
      const response = await api<{ data: { count: number } }>('/announcements/unread-count')
      if (version === requestVersion.value && user.value?.id === userId) {
        unreadCount.value = response.data.count
      }
    } catch {
      // Keep the last known count when a background refresh fails.
    }
  }

  async function markRead(id: number) {
    await api(`/announcements/${id}/read`, { method: 'POST' })
    await refreshUnreadCount()
  }

  return { unreadCount, refreshUnreadCount, markRead }
}
