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

  const logger = new Logger('PhotoCredits')
  let isRefreshing = $state(false)

  const withUtm = (url: string) =>
    `${url}${url.includes('?') ? '&' : '?'}utm_source=odysea&utm_medium=referral`

  const photo = $derived.by(() => {
    const info = background.info?.unsplashInfo
    if (!info) return null
    const { location, user, exif, links, description } = info
    return {
      title: location?.name || description || 'Daily Wallpaper',
      location: location?.name,
      subLocation: [location?.city, location?.country]
        .filter(Boolean)
        .join(', '),
      description,
      photographer: user?.name,
      photographerUrl: user?.links?.html ? withUtm(user.links.html) : undefined,
      photoUrl: links?.html ? withUtm(links.html) : undefined,
      camera: [exif?.make, exif?.model].filter(Boolean).join(' '),
      exif: [
        exif?.aperture && `ƒ/${exif.aperture}`,
        exif?.exposure_time && `${exif.exposure_time}s`,
        exif?.focal_length && `${exif.focal_length}mm`,
        exif?.iso && `ISO ${exif.iso}`,
      ]
        .filter(Boolean)
        .join(' · '),
    }
  })

  const unsplashHomeUrl = withUtm('https://unsplash.com')

  const triggerTitle = $derived(
    photo?.location && photo.photographer
      ? `${photo.location} by ${photo.photographer}`
      : photo?.photographer
        ? `Photo by ${photo.photographer}`
        : photo?.location || 'Daily photo on Unsplash'
  )

  const headerIcon = $derived(
    photo?.location
      ? mdiMapMarkerOutline
      : photo?.description
        ? mdiImageOutline
        : null
  )

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
</script>

{#snippet externalLink(href: string, text: string, className = '')}
  <a
    {href}
    target="_blank"
    rel="noopener noreferrer"
    class="hover:underline inline-flex items-center gap-0.5 {className}"
  >
    {text}
    <Icon path={mdiOpenInNew} size={12} class="opacity-70" />
  </a>
{/snippet}

<Popover.Root>
  <Popover.Trigger
    class={[
      'group flex items-center gap-2 text-xs text-white/70 hover:text-white',
      'rounded-lg px-2.5 py-2.5 transition-colors cursor-pointer select-none',
      'hover:bg-white/10 active:bg-white/15',
    ]}
    title={triggerTitle}
    aria-label={triggerTitle}
  >
    <IconUnsplash size={16} class="shrink-0 text-white/80" />
    {#if photo?.location}
      <span
        class="relative inline-grid [grid-template-areas:'stack'] text-left max-w-72"
      >
        <span
          class={[
            '[grid-area:stack] truncate font-medium text-white/90 group-hover:text-white',
            'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
            photo.photographer &&
              'translate-y-0 group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2',
          ]}
        >
          {photo.location}
        </span>
        {#if photo.photographer}
          <span
            class={[
              '[grid-area:stack] truncate text-[10px] text-white/60 pointer-events-none',
              'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
              'translate-y-0 opacity-0 group-hover:translate-y-1/2 group-hover:opacity-100 group-focus-visible:translate-y-1/2 group-focus-visible:opacity-100',
            ]}
          >
            {photo.photographer}
          </span>
        {/if}
      </span>
    {:else if photo?.photographer}
      <span class="truncate max-w-72 text-left text-white/80">
        Photo by {photo.photographer}
      </span>
    {:else}
      <span class="text-white/70">Daily Photo</span>
    {/if}
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
          {#if headerIcon}
            <Icon path={headerIcon} size={18} />
          {:else}
            <IconUnsplash size={18} />
          {/if}
        </div>
        <div class="flex flex-col min-w-0">
          <h3
            class="font-semibold text-sm text-white leading-snug wrap-break-word line-clamp-2"
          >
            {photo?.title ?? 'Daily Wallpaper'}
          </h3>
          {#if photo?.subLocation && photo.subLocation !== photo.location}
            <p
              class="text-xs text-white/60 leading-tight mt-0.5 wrap-break-word"
            >
              {photo.subLocation}
            </p>
          {/if}
        </div>
      </div>

      <!-- Photographer attribution & Unsplash links -->
      <div
        class="flex flex-col gap-1 text-xs text-white/80 border-t border-white/10 pt-2.5"
      >
        <div class="flex items-center gap-1 flex-wrap">
          <span>Photo by</span>
          {#if photo?.photographerUrl && photo.photographer}
            {@render externalLink(
              photo.photographerUrl,
              photo.photographer,
              'font-medium text-white'
            )}
          {:else}
            <span class="font-medium text-white"
              >{photo?.photographer || 'Unknown'}</span
            >
          {/if}
          <span>on</span>
          {@render externalLink(
            unsplashHomeUrl,
            'Unsplash',
            'font-medium text-white'
          )}
        </div>

        {#if photo?.photoUrl}
          {@render externalLink(
            photo.photoUrl,
            'View photo on Unsplash',
            'text-[11px] text-white/50 hover:text-white/80 mt-0.5'
          )}
        {/if}
      </div>

      <!-- Additional info: Camera EXIF & Details -->
      {#if photo?.camera || photo?.exif}
        <div
          class="flex items-start gap-2 bg-white/5 rounded-lg p-2.5 text-xs text-white/80 border border-white/10"
        >
          <Icon
            path={mdiCameraOutline}
            size={16}
            class="shrink-0 text-white/60 mt-0.5"
          />
          <div class="flex flex-col min-w-0">
            {#if photo.camera}
              <span class="font-medium text-white/90 truncate"
                >{photo.camera}</span
              >
            {/if}
            {#if photo.exif}
              <span class="text-white/60 text-[11px] font-mono tracking-tight"
                >{photo.exif}</span
              >
            {/if}
          </div>
        </div>
      {/if}

      {#if photo?.location && photo?.description}
        <p class="text-xs text-white/60 italic line-clamp-2">
          "{photo.description}"
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
