<script lang="ts">
  import {
    mdiPause,
    mdiPlay,
    mdiRepeat,
    mdiRepeatOff,
    mdiRepeatOnce,
    mdiShuffleVariant,
    mdiSkipNext,
    mdiSkipPrevious,
    mdiVolumeHigh,
    mdiVolumeLow,
    mdiVolumeMedium,
    mdiVolumeOff
  } from '@mdi/js'
  import Icon from '../atoms/Icon.svelte'
  import { millisecondsToTime } from "@melledijkstra/toolbox"
  import type { PlaybackState } from 'MusicPlayer'
  import type { HTMLAttributes } from 'svelte/elements'
  import { Slider } from 'bits-ui'
  
  type PlaybackProps = {
    playbackState: PlaybackState
    onToggleShuffle?: (shuffle: boolean) => void
    onPreviousTrack?: () => void
    onPlayPause?: () => void
    onNextTrack?: () => void
    onSwitchRepeatMode?: (mode: number) => void
    onSeek?: (position_ms: number) => void
    onVolumeChange?: (volume: number) => void
    class?: HTMLAttributes<HTMLDivElement>['class']
  }

  const {
    playbackState: state,
    onToggleShuffle,
    onPreviousTrack,
    onPlayPause,
    onNextTrack,
    onSwitchRepeatMode,
    onSeek,
    onVolumeChange,
    ...props
  }: PlaybackProps = $props()

  const isShuffling = $derived(state?.shuffle ?? false)

  const repeatMode = $derived(state?.repeatMode ?? 0)
  const repeatModeIcon = $derived.by(() => {
    switch (repeatMode) {
      case 1:
        return mdiRepeatOnce
      case 2:
        return mdiRepeat
      case 0:
      default:
        return mdiRepeatOff
    }
  })
  const mediaItem = $derived(state?.currentItem)
  const position_ms = $derived(state?.position_ms ?? 0)
  // let remaining = $derived(mediaItem ? mediaItem.duration_ms - position_ms : 0)
  // let timeLeft = $derived<string>(millisecondsToTime(remaining))
  const duration = $derived(mediaItem?.duration_ms ? millisecondsToTime(mediaItem.duration_ms) : 0)
  const currentTime = $derived<string>(millisecondsToTime(position_ms))

  const volumeIcon = $derived.by(() => {
    if (state.volume === 0) {
      return mdiVolumeOff
    } else if (state.volume < 15) {
      return mdiVolumeLow
    } else if (state.volume < 55) {
      return mdiVolumeMedium
    } else {
      return mdiVolumeHigh
    }
  })
</script>

<div class={["text-white", props.class]}>
  <!-- Seeker -->
  <Slider.Root
    type="single"
    value={position_ms}
    onValueCommit={(value) => onSeek?.(value)}
    max={mediaItem?.duration_ms ?? 0}
    class="bg-transparent relative flex w-full touch-none select-none items-center cursor-pointer group/seeker"
  >
    <span
      class="bg-white/50 relative h-1 w-full grow overflow-hidden"
    >
      <Slider.Range class="bg-white absolute h-full" />
    </span>
    <Slider.Thumb
      index={0}
      class={[
        "block size-2.5 bg-background shadow-sm cursor-pointer rounded-full",
        "dark:bg-white dark:shadow-black/30",
        "border border-white/70 hover:border-white",
        "scale-0 group-hover/seeker:scale-100 data-active:scale-120 transition-transform",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-hidden",
      ]}
    />
  </Slider.Root>
  <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 items-center max-w-full p-2">
    <!-- Track Info -->
    <div class="flex flex-row">
      <img
        draggable="false"
        class="size-15 aspect-square rounded-sm"
        src={mediaItem?.album?.coverArtUrl ?? '/icons/album-cover-placeholder.png'}
        alt={mediaItem?.title ?? 'Track cover'}
      />
      <div class="flex flex-col ml-2 justify-center overflow-hidden">
        <strong class="truncate text-sm">{mediaItem?.title ?? 'No item playing'}</strong>
        <p class="truncate text-xs">
          {mediaItem?.artist.name ?? '-'}
        </p>
      </div>
    </div>
    <!-- Controls -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-row gap-3 items-center">
        <button
          class="cursor-pointer"
          onclick={() => {
            onToggleShuffle?.(!isShuffling)
          }}
        >
          <Icon
            class="size-6 {isShuffling && 'text-green-500'}"
            path={mdiShuffleVariant}
          />
        </button>
        <button class="cursor-pointer" onclick={() => onPreviousTrack?.()}>
          <Icon class="size-6" path={mdiSkipPrevious} />
        </button>
        <button class="cursor-pointer p-1 rounded-full bg-white text-black" onclick={() => onPlayPause?.()}>
          <Icon class="size-6" path={state?.isPlaying ? mdiPause : mdiPlay} />
        </button>
        <button class="cursor-pointer" onclick={() => onNextTrack?.()}>
          <Icon class="size-6" path={mdiSkipNext} />
        </button>
        <button
          class="cursor-pointer disabled:text-gray-500 disabled:cursor-not-allowed"
          onclick={() => onSwitchRepeatMode?.(repeatMode === 2 ? 0 : repeatMode + 1)}
        >
          <Icon class="size-6 {repeatMode > 0 ? 'text-green-500' : ''}" path={repeatModeIcon} />
        </button>
      </div>
    </div>
    <div class="flex flex-row justify-evenly">
      <!-- Time Indication (set specific width to avoid layout shift) -->
      <span class="w-[5em] text-sm text-nowrap">{currentTime} / {duration}</span>
      <!-- Volume Control -->
      <div class="flex flex-row items-center gap-2 w-[110px]">
        <Icon path={volumeIcon} size={20} />
        <Slider.Root
          type="single"
          orientation="horizontal"
          bind:value={state.volume}
          onValueCommit={(value) => onVolumeChange?.(value)}
          min={0}
          step={1}
          max={100}
          class="relative flex w-full touch-none select-none items-center cursor-pointer group/volume"
        >
          <span
            class="relative w-full h-1 grow overflow-hidden rounded antialiased"
          >
            <span class="absolute h-full w-full bg-white rounded"></span>
            <span class="absolute h-full bg-gray-500 rounded" style="left: 0%; right: {100 - state.volume}%;"></span>
            <Slider.Range />
          </span>
          <Slider.Thumb
            index={0}
            class={[
              "block size-2 bg-background shadow-sm cursor-pointer rounded-full",
              "dark:bg-white dark:shadow-black/30",
              "border border-white/70 hover:border-white",
              "scale-0 group-hover/volume:scale-100 data-active:scale-120 transition-transform",
              "disabled:pointer-events-none disabled:opacity-50",
              "focus-visible:outline-hidden",
            ]}
          />
        </Slider.Root>
      </div>
    </div>
  </div>
</div>
