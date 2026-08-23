<script lang="ts">
  import { unsplashClient } from '@/api/unsplash'
  import { background, setBackgroundImage } from '@/stores/background.svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { mdiCameraRetakeOutline } from '@mdi/js'
  import { settingsStore } from '@/settings/index.svelte'
  import { Logger } from '@/logger'

  const logger = new Logger('ImageRefreshButton')

  const serverlessHost = $derived(settingsStore.network.serverlessHost)
  const dailyImageQuery = $derived(settingsStore.ui.dailyImageQuery)
  const dailyImageCollections = $derived(settingsStore.ui.dailyImageCollections)

  async function refreshBackround() {
    try {
      const url = await unsplashClient.refreshDailyImage()
      if (url) {
        await setBackgroundImage(url)
      } else {
        background.error = true
        background.url = undefined
      }
    } catch {
      background.error = true
      background.url = undefined
    }
  }

  $effect(() => {
    // Clear the cache whenever the query parameters for Unsplash change
    if (serverlessHost || dailyImageQuery || dailyImageCollections) {
      logger.log('Unsplash settings changed, clearing next image cache')
      unsplashClient.clearNextImage()
    }
  })
</script>

<IconButton
  size={25}
  disabled={!settingsStore.loaded}
  onclick={refreshBackround}
  icon={mdiCameraRetakeOutline}
  aria-label="Refresh background image"
  title="Refresh background image"
/>
