<script lang="ts">
  import AuthButton from '@/components/AuthButton.svelte'
  import { authState, type OAuthProvider } from '@/oauth2/auth.state.svelte'
</script>

{#await authState.initialize() then}
  <table class="w-full table-auto md:table-fixed">
    <thead
      class="text-xs uppercase text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
    >
      <tr>
        <th class="px-6 py-3">Provider</th>
        <th class="px-6 py-3">isAuthenticated</th>
        <!-- <th>Token</th> -->
        <th class="px-6 py-3">Scopes</th>
        <th class="px-6 py-3">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.keys(authState.providers) as provider (provider)}
        {@const providerKey = provider as OAuthProvider}
        {@const providerState = authState.providers[providerKey]}
        {@const client = authState.clients[providerKey]}
        <tr
          class="bg-white dark:bg-gray-800 dark:border-gray-700 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td class="px-6 py-4 whitespace-nowrap">{provider}</td>
          <td class="px-6 py-4 whitespace-nowrap"
            >{providerState.isAuthenticated}</td
          >
          <!-- <td>{providerState.token}</td> -->
          <td class="px-6 py-4 whitespace-wrap"
            >{providerState.scopes?.join(', ')}</td
          >
          <td class="px-6 py-4 whitespace-nowrap">
            <AuthButton
              provider={providerKey}
              authenticated={providerState.isAuthenticated}
              onclick={() =>
                providerState.isAuthenticated
                  ? client.revokeToken()
                  : client.getAuthToken(true)}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/await}
