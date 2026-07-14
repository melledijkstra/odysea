<script lang="ts">
  import { UnsplashClient } from '@/api/unsplash'
  import { setBackgroundImage } from '@/stores/background.svelte'
  import IconButton from './atoms/IconButton.svelte'
  import { mdiCameraRetakeOutline } from '@mdi/js'
  import { settingsStore } from '@/settings/index.svelte'
  import { Logger } from '@/logger'

  const logger = new Logger('ImageRefreshButton')

  const unsplashClient = $state<UnsplashClient>(
    new UnsplashClient(
      settingsStore.network.serverlessHost,
      settingsStore.ui.dailyImageQuery
    )
  )

  const serverlessHost = $derived(settingsStore.network.serverlessHost)
  const dailyImageQuery = $derived(settingsStore.ui.dailyImageQuery)

  async function refreshBackround() {
    const url = await unsplashClient?.refreshDailyImage()
    if (url) {
      setBackgroundImage(url)
    }
  }

  $effect(() => {
    if (!!serverlessHost && serverlessHost !== unsplashClient?.host) {
      unsplashClient.setHost(serverlessHost)
    }
  })

  $effect(() => {
    logger.log('settings changed', {
      serverlessHost: settingsStore.network.serverlessHost,
      unsplashHost: unsplashClient?.host,
      dailyImageQuery: settingsStore.ui.dailyImageQuery,
      unsplashQuery: unsplashClient.query
    })
    if (!!serverlessHost && serverlessHost !== unsplashClient?.host) {
      logger.log('serverlessHost changed', {
        serverlessHost,
        unsplashHost: unsplashClient?.host
      })
      unsplashClient.setHost(settingsStore.network.serverlessHost)
    }
    if (dailyImageQuery !== unsplashClient.query) {
      logger.log('query changed', {
        dailyImageQuery,
        unsplashQuery: unsplashClient.query
      })
      unsplashClient.query = settingsStore.ui.dailyImageQuery
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
