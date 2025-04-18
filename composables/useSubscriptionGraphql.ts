import isEqual from 'lodash/isEqual'
import { apolloClientConfig } from '@/utils/constants'

export default function useSubscriptionGraphql<T = any>({
  clientName = '',
  query,
  onChange,
  onError,
  pollingInterval = 6000,
  disabled,
  immediate = true,
}: {
  clientName?: string
  query: string
  onChange: (data: { data: T }) => void
  onError?: (error) => void
  pollingInterval?: number
  disabled?: ComputedRef<boolean>
  immediate?: boolean
}) {
  const { client: prefixClient } = usePrefix()
  const { $consola } = useNuxtApp()
  const client = clientName || prefixClient.value
  const httpUrl = apolloClientConfig[client]?.httpEndpoint

  if (disabled?.value || !httpUrl) {
    return () => {}
  }

  let lastQueryResult: T | null = null
  let intervalId: number | null = null

  const isPolling = ref(false)

  async function pollData() {
    try {
      const response = await $fetch(httpUrl, {
        method: 'POST',
        body: {
          query: `
             query {
               ${query}
             }
           `,
        },
      })

      const newResult = response.data as T

      if (!isEqual(newResult, lastQueryResult)) {
        if (!lastQueryResult ? immediate : true) {
          $consola.log(`[Graphql Subscription] New changes: ${JSON.stringify(newResult)}`)
          onChange({ data: newResult })
        }
        lastQueryResult = newResult
      }
    }
    catch (error) {
      $consola.error('[Graphql Subscription] Polling error:', error)
      onError && onError(error)
    }
  }

  function startPolling() {
    if (!isPolling.value) {
      isPolling.value = true
      pollData()
      intervalId = setInterval(pollData, pollingInterval) as unknown as number
      $consola.log('[Graphql Subscription] Started polling')
    }
  }

  function stopPolling() {
    if (isPolling.value && intervalId !== null) {
      clearInterval(intervalId)
      isPolling.value = false
      $consola.log('[Graphql Subscription] Stopped polling')
    }
  }

  startPolling()

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return stopPolling
}
