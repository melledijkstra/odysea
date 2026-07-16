<script lang="ts">
  import browser, { type Manifest } from 'webextension-polyfill'
  import { onMount } from 'svelte'

  let manifest = $state<Manifest.WebExtensionManifest>()

  onMount(async () => {
    manifest = browser.runtime.getManifest()
  })
</script>

<h1 class="text-xl">About</h1>
<p class="text-sm"><strong>Extension Name:</strong> {manifest?.name}</p>
<p class="text-sm">
  <strong>Description:</strong>
  {manifest?.description}
</p>
<p class="text-sm"><strong>Version:</strong> {manifest?.version}</p>
