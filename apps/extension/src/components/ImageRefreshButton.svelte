<script lang="ts">
  import { unsplashClient } from '@/api/unsplash'
  import { setBackgroundImage } from '@/stores/background.svelte'
  import IconButton from './atoms/IconButton.svelte'
  import { mdiCameraRetakeOutline } from '@mdi/js'
  import { settingsStore } from '@/settings/index.svelte'
  import { Logger } from '@/logger'

  const logger = new Logger('ImageRefreshButton')

  const serverlessHost = $derived(settingsStore.network.serverlessHost)
  const dailyImageQuery = $derived(settingsStore.ui.dailyImageQuery)
  const dailyImageCollections = $derived(settingsStore.ui.dailyImageCollections)

  async function refreshBackround() {
    const url = await unsplashClient.refreshDailyImage()
    if (url) {
      setBackgroundImage(url)
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
/>
