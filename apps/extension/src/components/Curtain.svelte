<script lang="ts">
  import { onMount } from 'svelte'
  import { unsplashClient } from '@/api/unsplash'
  import { background, setBackgroundImage } from '@/stores/background.svelte'

  let loaded = $state(false)

  onMount(async () => {
    try {
      const url = await unsplashClient.getDailyImage()

      if (url) {
        await setBackgroundImage(url)
      } else {
        background.error = true
        background.url = undefined
      }
    } catch {
      background.error = true
      background.url = undefined
    } finally {
      loaded = true
    }
  })
</script>

<div
  class="fixed h-screen w-screen bg-black transition-opacity duration-300 top-0 left-0 -z-10 {loaded
    ? 'opacity-20'
    : 'opacity-100'}"
></div>
