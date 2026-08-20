<script lang="ts">
  import { useAccountQuery } from '@/queries/account'

  const accountQuery = useAccountQuery()
</script>

<a href="https://myaccount.google.com/" target="_blank">
  <img
    class="size-9 aspect-square rounded-full border-2 border-white/80"
    src={accountQuery.data?.picture ?? '/icons/default-account.jpg'}
    alt={accountQuery.data?.name ?? 'Account picture'}
  />
</a>
