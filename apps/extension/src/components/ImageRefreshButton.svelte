<script lang="ts">
  import { unsplashClient } from '@/api/unsplash'
  import { background, setBackgroundImage } from '@/stores/background.svelte'
  import { settingsStore } from '@/settings/index.svelte'
  import { Logger } from '@/logger'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import Spinner from '@melledijkstra/ui/svelte/Spinner.svelte'
  import IconUnsplash from '@/icons/IconUnsplash.svelte'
  import { Popover } from 'bits-ui'
  import {
    mdiCameraRetakeOutline,
    mdiMapMarkerOutline,
    mdiCameraOutline,
    mdiOpenInNew,
    mdiImageOutline,
  } from '@mdi/js'

  const logger = new Logger('ImageRefreshButton')

  const serverlessHost = $derived(settingsStore.network.serverlessHost)
  const dailyImageQuery = $derived(settingsStore.ui.dailyImageQuery)
  const dailyImageCollections = $derived(settingsStore.ui.dailyImageCollections)

  let isRefreshing = $state(false)

  function buildUnsplashUrl(url: string): string {
    try {
      const parsed = new URL(url)
      parsed.searchParams.set('utm_source', 'odysea')
      parsed.searchParams.set('utm_medium', 'referral')
      return parsed.toString()
    } catch {
      return `${url}?utm_source=odysea&utm_medium=referral`
    }
  }

  const unsplashInfo = $derived(background.info?.unsplashInfo)
  const locationName = $derived(unsplashInfo?.location?.name)
  const locationSub = $derived(
    [unsplashInfo?.location?.city, unsplashInfo?.location?.country]
      .filter(Boolean)
      .join(', ')
  )
  const photographerName = $derived(unsplashInfo?.user?.name)
  const photographerProfileUrl = $derived(
    unsplashInfo?.user?.links?.html
      ? buildUnsplashUrl(unsplashInfo.user.links.html)
      : undefined
  )
  const photoPageUrl = $derived(
    unsplashInfo?.links?.html
      ? buildUnsplashUrl(unsplashInfo.links.html)
      : undefined
  )
  const unsplashHomeUrl = buildUnsplashUrl('https://unsplash.com')
  const description = $derived(unsplashInfo?.description)

  const camera = $derived(
    [unsplashInfo?.exif?.make, unsplashInfo?.exif?.model]
      .filter(Boolean)
      .join(' ')
  )

  const exifSummary = $derived(
    [
      unsplashInfo?.exif?.aperture ? `ƒ/${unsplashInfo.exif.aperture}` : null,
      unsplashInfo?.exif?.exposure_time
        ? `${unsplashInfo.exif.exposure_time}s`
        : null,
      unsplashInfo?.exif?.focal_length
        ? `${unsplashInfo.exif.focal_length}mm`
        : null,
      unsplashInfo?.exif?.iso ? `ISO ${unsplashInfo.exif.iso}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  )

  const triggerTitle = $derived.by(() => {
    if (locationName && photographerName) {
      return `${locationName} by ${photographerName}`
    }
    if (photographerName) {
      return `Photo by ${photographerName}`
    }
    if (locationName) {
      return locationName
    }
    return 'Daily photo on Unsplash'
  })

  async function refreshBackground() {
    if (isRefreshing) return
    isRefreshing = true
    try {
      const result = await unsplashClient.refreshDailyImage()
      if (result) {
        await setBackgroundImage(result.imageData, result.info)
      } else {
        background.error = true
        background.url = undefined
      }
    } catch (err) {
      logger.error('Failed to refresh background image', err)
      background.error = true
      background.url = undefined
    } finally {
      isRefreshing = false
    }
  }

  let initialSettingsLoaded = false
  let prevSettings: string | null = null

  $effect(() => {
    // Only react after settings have finished loading from storage
    if (!settingsStore.loaded) return

    const currentSettingsKey = JSON.stringify({
      host: serverlessHost,
      query: dailyImageQuery,
      collections: dailyImageCollections,
    })

    if (!initialSettingsLoaded) {
      initialSettingsLoaded = true
      prevSettings = currentSettingsKey
      return
    }

    if (prevSettings !== currentSettingsKey) {
      prevSettings = currentSettingsKey
      logger.log('Unsplash settings changed, clearing next image cache')
      unsplashClient.clearNextImage()
    }
  })
</script>

<Popover.Root>
  <Popover.Trigger
    class={[
      'flex items-center gap-2 text-xs text-white/70 hover:text-white',
      'rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer select-none',
      'hover:bg-white/10 active:bg-white/15',
    ]}
    title={triggerTitle}
    aria-label={triggerTitle}
  >
    <IconUnsplash size={16} class="shrink-0 text-white/80" />
    <span class="truncate max-w-72 text-left flex items-center gap-1.5">
      {#if locationName}
        <span class="font-medium text-white/90 truncate">{locationName}</span>
        {#if photographerName}
          <span class="text-white/40 shrink-0">&bull;</span>
          <span class="text-white/70 truncate">{photographerName}</span>
        {/if}
      {:else if photographerName}
        <span class="text-white/80 truncate">Photo by {photographerName}</span>
      {:else}
        <span class="text-white/70">Daily Photo</span>
      {/if}
    </span>
  </Popover.Trigger>

  <PopPanel
    side="top"
    align="start"
    panelProps={{ size: 'small', class: 'w-80 p-4' }}
  >
    <div class="flex flex-col gap-3">
      <!-- Header / Location / Title -->
      <div class="flex items-start gap-2.5">
        <div class="p-1.5 rounded-md bg-white/10 text-white shrink-0 mt-0.5">
          {#if locationName}
            <Icon path={mdiMapMarkerOutline} size={18} />
          {:else if description}
            <Icon path={mdiImageOutline} size={18} />
          {:else}
            <IconUnsplash size={18} />
          {/if}
        </div>
        <div class="flex flex-col min-w-0">
          {#if locationName}
            <h3
              class="font-semibold text-sm text-white leading-snug wrap-break-word"
            >
              {locationName}
            </h3>
            {#if locationSub && locationSub !== locationName}
              <p
                class="text-xs text-white/60 leading-tight mt-0.5 wrap-break-word"
              >
                {locationSub}
              </p>
            {/if}
          {:else if description}
            <h3
              class="font-semibold text-sm text-white leading-snug line-clamp-2"
            >
              {description}
            </h3>
          {:else}
            <h3 class="font-semibold text-sm text-white leading-snug">
              Daily Wallpaper
            </h3>
          {/if}
        </div>
      </div>

      <!-- Photographer attribution & Unsplash links -->
      <div
        class="flex flex-col gap-1 text-xs text-white/80 border-t border-white/10 pt-2.5"
      >
        <div class="flex items-center gap-1 flex-wrap">
          <span>Photo by</span>
          {#if photographerProfileUrl && photographerName}
            <a
              href={photographerProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-white hover:underline inline-flex items-center gap-0.5"
            >
              {photographerName}
              <Icon path={mdiOpenInNew} size={12} class="opacity-70" />
            </a>
          {:else}
            <span class="font-medium text-white"
              >{photographerName || 'Unknown'}</span
            >
          {/if}
          <span>on</span>
          <a
            href={unsplashHomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-white hover:underline inline-flex items-center gap-0.5"
          >
            Unsplash
            <Icon path={mdiOpenInNew} size={12} class="opacity-70" />
          </a>
        </div>

        {#if photoPageUrl}
          <a
            href={photoPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] text-white/50 hover:text-white/80 inline-flex items-center gap-1 transition-colors w-fit mt-0.5"
          >
            View photo on Unsplash
            <Icon path={mdiOpenInNew} size={11} />
          </a>
        {/if}
      </div>

      <!-- Additional info: Camera EXIF & Details -->
      {#if camera || exifSummary}
        <div
          class="flex items-start gap-2 bg-white/5 rounded-lg p-2.5 text-xs text-white/80 border border-white/10"
        >
          <Icon
            path={mdiCameraOutline}
            size={16}
            class="shrink-0 text-white/60 mt-0.5"
          />
          <div class="flex flex-col min-w-0">
            {#if camera}
              <span class="font-medium text-white/90 truncate">{camera}</span>
            {/if}
            {#if exifSummary}
              <span class="text-white/60 text-[11px] font-mono tracking-tight"
                >{exifSummary}</span
              >
            {/if}
          </div>
        </div>
      {/if}

      {#if locationName && description}
        <p class="text-xs text-white/60 italic line-clamp-2">
          "{description}"
        </p>
      {/if}

      <!-- Action item: Refresh button -->
      <button
        type="button"
        class={[
          'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg',
          'bg-white/10 hover:bg-white/20 active:bg-white/25',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'text-xs font-medium text-white transition-colors cursor-pointer',
        ]}
        disabled={isRefreshing || !settingsStore.loaded}
        onclick={refreshBackground}
      >
        {#if isRefreshing}
          <Spinner size={14} />
          <span>Loading new photo...</span>
        {:else}
          <Icon path={mdiCameraRetakeOutline} size={16} />
          <span>Change photo</span>
        {/if}
      </button>
    </div>
  </PopPanel>
</Popover.Root>
