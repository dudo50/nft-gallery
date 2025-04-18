<template>
  <NeoDropdownItem
    :disabled="!canDelete"
    @click="deleteNfts"
  >
    {{ $i18n.t('moreActions.deleteNfts') }}
  </NeoDropdownItem>
</template>

<script setup lang="ts">
import { NeoDropdownItem } from '@kodadot1/brick'
import type { NFTWithMetadata } from '@/composables/useNft'
import nftEntitiesByIDs from '@/queries/subsquid/general/nftEntitiesByIDs.graphql'
import nftIdListByCollection from '@/queries/subsquid/general/nftIdListByCollection'

const props = defineProps<{
  collection: any
}>()

const data = ref<{ nfts?: { id: string }[] }>()

const { $i18n, $apolloClient } = useNuxtApp()
const { client } = usePrefix()
const { accountId } = useAuth()

const { listNftByNftWithMetadata } = useListingCartModal()
const preferencesStore = usePreferencesStore()

const collectionId = computed(() => props.collection.id)
const nftIds = computed(() => data.value?.nfts?.map(nft => nft.id) || [])

const { result: nfts } = useQuery<{ nftEntities: NFTWithMetadata[] }>(
  nftEntitiesByIDs,
  computed(() => ({
    ids: nftIds.value,
  })),
  computed(() => ({
    clientId: client.value,
  })),
)

const canDelete = computed(() => Boolean(nfts.value?.nftEntities?.length))

const deleteNfts = async () => {
  nfts.value?.nftEntities?.forEach(nft => listNftByNftWithMetadata(nft))

  preferencesStore.setOpenedUserCartModal('burn', { silent: true })
}

onBeforeMount(async () => {
  const response = await $apolloClient.query({
    query: nftIdListByCollection,
    variables: {
      id: collectionId.value,
      search: [{ currentOwner_eq: accountId.value }],
    },
    context: {
      endpoint: client.value,
    },
  })

  data.value = response.data
})
</script>
