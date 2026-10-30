<template>
  <div class="mx-auto max-w-[1000px]">
    <section class="rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <div class="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a17647]">News and Updates</p>
          <h1 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#24221d] sm:text-3xl">Announcements</h1>
          <p class="mt-1 text-sm text-[#8c8571]">Stay informed about the latest news, notices, and updates.</p>
        </div>
        <button
          v-if="isSuperAdmin"
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]"
          @click="openComposer()"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          {{ composerOpen ? 'Cancel announcement' : 'New announcement' }}
        </button>
      </div>

      <form v-if="isSuperAdmin && composerOpen" class="mt-7 rounded-xl border border-[#dfd5c5] bg-[#f7f4ed] p-5 sm:p-6" @submit.prevent="publish">
        <div class="flex items-center justify-between gap-4"><p class="text-sm font-semibold text-[#24221d]">{{ editingAnnouncement ? 'Edit announcement' : 'Publish an update' }}</p><span class="text-xs text-[#857d6f]">Visible to all users</span></div>
        <p v-if="formError" class="mt-4 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-3.5 py-2.5 text-sm text-[#a8493a]">{{ formError }}</p>
        <label class="mt-5 block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Title</span><input v-model.trim="form.title" maxlength="180" required placeholder="What should everyone know?" class="w-full rounded-lg border border-[#e2ddd0] bg-[#fbfaf6] px-3.5 py-2.5 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none" /></label>
        <label class="mt-4 block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Message</span><textarea v-model.trim="form.body" required maxlength="10000" rows="5" placeholder="Write the details here…" class="w-full resize-y rounded-lg border border-[#e2ddd0] bg-[#fbfaf6] px-3.5 py-2.5 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none" /></label>
        <label class="mt-4 block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Media <span class="font-normal text-[#857d6f]">(optional)</span></span><input :key="fileInputKey" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" class="block w-full text-sm text-[#766f61] file:mr-4 file:rounded-lg file:border-0 file:bg-[#eee8dc] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#6b5b45] hover:file:bg-[#e5dccd]" @change="selectMedia" /><p class="mt-1.5 text-xs text-[#857d6f]">JPEG, PNG, WebP, GIF, MP4, or WebM. Maximum 20 MB.</p><p v-if="editingAnnouncement && !mediaName" class="mt-1 text-xs text-[#857d6f]">Leave empty to keep the current attachment.</p><p v-if="mediaName" class="mt-1 text-xs font-medium text-[#6b5b45]">Attached: {{ mediaName }}</p></label>
        <div class="mt-6 flex justify-end gap-2 border-t border-[#dfd5c5] pt-4"><button type="button" class="rounded-lg border border-[#d8cfbf] px-4 py-2 text-sm font-medium text-[#4d493e] hover:bg-[#eee8dc]" :disabled="publishing" @click="resetComposer">Cancel</button><button type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:cursor-not-allowed disabled:opacity-60" :disabled="publishing">{{ publishing ? 'Saving…' : editingAnnouncement ? 'Save changes' : 'Publish announcement' }}</button></div>
      </form>
    </section>

    <section class="mt-6">
      <div v-if="pending" class="space-y-4"><div v-for="item in 3" :key="item" class="h-44 animate-pulse rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6]" /></div>
      <div v-else-if="announcements.length" class="space-y-4">
        <article v-for="announcement in announcements" :key="announcement.id" class="overflow-hidden rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_1px_2px_rgba(36,34,29,0.04)]">
          <button v-if="isImage(announcement.media_type) && announcement.media_url" type="button" class="group relative block w-full cursor-zoom-in overflow-hidden bg-[#eee8dc]" :aria-label="`View image for ${announcement.title}`" @click="viewImage(announcement)"><img :src="announcement.media_url" :alt="announcement.title" class="max-h-[28rem] w-full object-cover transition duration-200 group-hover:scale-[1.01]" loading="lazy" /><span class="absolute right-4 bottom-4 rounded-full bg-[#24221d]/75 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">View media</span></button>
          <video v-else-if="announcement.media_url" class="max-h-[28rem] w-full bg-[#24221d]" controls preload="metadata"><source :src="announcement.media_url" :type="announcement.media_type ?? undefined" />Your browser does not support this video.</video>
          <div class="p-6 sm:p-7"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#857d6f]"><span class="font-medium text-[#8a6238]">Posted by {{ announcement.created_by?.name ?? 'Platform administration' }}</span><span aria-hidden="true">•</span><time :datetime="announcement.created_at">{{ formatDate(announcement.created_at) }}</time></div><div v-if="isSuperAdmin" class="flex items-center gap-2"><button type="button" class="rounded-lg border border-[#e2ddd0] px-2.5 py-1.5 text-xs font-medium text-[#4d493e] hover:bg-[#f1eee7]" @click="editAnnouncement(announcement)">Edit</button><button type="button" class="rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-2.5 py-1.5 text-xs font-medium text-[#a8493a] hover:bg-[#f7e6e3]" @click="deleteAnnouncement(announcement)">Delete</button></div></div><h2 class="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#24221d]">{{ announcement.title }}</h2><p class="mt-3 whitespace-pre-line text-sm leading-6 text-[#5f594d]">{{ announcementPreview(announcement) }}</p><button v-if="isLongBody(announcement.body)" type="button" class="cursor-pointer mt-2 text-sm font-medium text-[#8a6238] hover:text-[#6f4c29] hover:underline" :aria-expanded="isExpanded(announcement.id)" @click="toggleExpanded(announcement.id)">{{ isExpanded(announcement.id) ? 'Read less' : 'Read more' }}</button></div>
        </article>
      </div>
      <div v-else class="rounded-2xl border border-dashed border-[#dcd4c6] bg-[#fbfaf6] px-6 py-14 text-center"><p class="text-sm font-medium text-[#4d493e]">No announcements yet.</p><p class="mt-1 text-sm text-[#857d6f]">Updates shared by the platform team will appear here.</p></div>

      <div v-if="lastPage > 1" class="mt-6 flex items-center justify-between"><p class="text-sm text-[#857d6f]">Page {{ page }} of {{ lastPage }}</p><div class="flex gap-2"><button type="button" class="rounded-lg border border-[#e2ddd0] px-3 py-2 text-sm font-medium text-[#4d493e] disabled:opacity-40" :disabled="page === 1" @click="page--">Previous</button><button type="button" class="rounded-lg border border-[#e2ddd0] px-3 py-2 text-sm font-medium text-[#4d493e] disabled:opacity-40" :disabled="page === lastPage" @click="page++">Next</button></div></div>
    </section>

    <Teleport to="body"><div v-if="viewingImage" class="fixed inset-0 z-50 flex items-center justify-center bg-[#24221d]/90 p-4 sm:p-8" role="dialog" aria-modal="true" :aria-label="`Image: ${viewingImage.title}`" @click.self="viewingImage = null"><button type="button" class="absolute top-5 right-5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20" @click="viewingImage = null">Close</button><img :src="viewingImage.media_url ?? ''" :alt="viewingImage.title" class="max-h-full max-w-full rounded-lg object-contain" /></div></Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Announcements', 
  eyebrow: 'Updates', 
  middleware: 'auth', 
  layout: 'client' 
})

type Announcement = { id: number; title: string; body: string; media_url?: string | null; media_type?: string | null; created_at: string; created_by?: { name: string } | null }
const api = useApi()
const { user } = useAuth()
const page = ref(1)
const composerOpen = ref(false)
const publishing = ref(false)
const formError = ref('')
const selectedMedia = ref<File | null>(null)
const editingAnnouncement = ref<Announcement | null>(null)
const viewingImage = ref<Announcement | null>(null)
const fileInputKey = ref(0)
const expandedAnnouncementIds = ref<Set<number>>(new Set())
const announcementPreviewLength = 360
const mediaName = computed(() => selectedMedia.value?.name ?? '')
const form = reactive({ title: '', body: '' })
const isSuperAdmin = computed(() => user.value?.role === 'super-admin')

const { data, pending, refresh } = await useAsyncData('announcements', () => api('/announcements', { query: { page: page.value, per_page: 12 } }), { watch: [page] })
const announcements = computed<Announcement[]>(() => data.value?.data ?? [])
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)

function selectMedia(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (file && file.size > 20 * 1024 * 1024) { formError.value = 'Media must be 20 MB or smaller.'; selectedMedia.value = null; return }
  selectedMedia.value = file
}

function resetComposer() { form.title = ''; form.body = ''; selectedMedia.value = null; editingAnnouncement.value = null; formError.value = ''; composerOpen.value = false; fileInputKey.value++ }
function openComposer() { if (composerOpen.value) resetComposer(); else composerOpen.value = true }
function viewImage(announcement: Announcement) { viewingImage.value = announcement }
function editAnnouncement(announcement: Announcement) { form.title = announcement.title; form.body = announcement.body; selectedMedia.value = null; editingAnnouncement.value = announcement; formError.value = ''; composerOpen.value = true; fileInputKey.value++ }
function isImage(type?: string | null) { return type?.startsWith('image/') ?? false }
function isLongBody(body: string) { return body.length > announcementPreviewLength }
function isExpanded(id: number) { return expandedAnnouncementIds.value.has(id) }
function announcementPreview(announcement: Announcement) { return isExpanded(announcement.id) || !isLongBody(announcement.body) ? announcement.body : `${announcement.body.slice(0, announcementPreviewLength).trimEnd()}…` }
function toggleExpanded(id: number) { const expanded = new Set(expandedAnnouncementIds.value); expanded.has(id) ? expanded.delete(id) : expanded.add(id); expandedAnnouncementIds.value = expanded }
function formatDate(value: string) { return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value)) }

async function publish() {
  formError.value = ''
  const payload = new FormData()
  payload.append('title', form.title)
  payload.append('body', form.body)
  if (selectedMedia.value) payload.append('media', selectedMedia.value)
  publishing.value = true
  try { await api(editingAnnouncement.value ? `/announcements/${editingAnnouncement.value.id}` : '/announcements', { method: editingAnnouncement.value ? 'PUT' : 'POST', body: payload }); resetComposer(); page.value = 1; await refresh() }
  catch (error: any) { const errors = error?.data?.errors; formError.value = errors ? Object.values(errors).flat()[0] as string : error?.data?.message ?? 'Unable to publish the announcement.' }
  finally { publishing.value = false }
}

async function deleteAnnouncement(announcement: Announcement) {
  if (!confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return
  try { await api(`/announcements/${announcement.id}`, { method: 'DELETE' }); if (announcements.value.length === 1 && page.value > 1) page.value--; else await refresh() }
  catch (error: any) { formError.value = error?.data?.message ?? 'Unable to delete the announcement.' }
}
</script>
