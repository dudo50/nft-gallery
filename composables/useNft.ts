import unionBy from 'lodash/unionBy'
import type { Ref } from 'vue'
import type { NFT, NFTMetadata } from '@/components/rmrk/service/scheme'
import { sanitizeIpfsUrl } from '@/utils/ipfs'
import type { BaseNFTMeta } from '@/components/base/types'
import { processSingleMetadata } from '@/utils/cachingStrategy'
import { getMimeType, isAudio as isAudioMimeType } from '@/utils/gallery/media'
import { getMetadata } from '@/services/imageWorker'
import { DYNAMIC_METADATA } from '@/services/fxart'

export type NftResources = {
  id: string
  src?: string
  thumb?: string
  mimeType?: string
  animation?: string
  meta?: {
    id: string
    image?: string
    animationUrl?: string
  }
}

export type ItemResources = {
  mediaUri?: string
  resources?: NftResources[]
}

type baseMimeType = {
  imageMimeType?: string
  animationUrlMimeType?: string
}

export type NFTWithMetadata = NFT &
  NFTMetadata & { meta: BaseNFTMeta } & ItemResources &
  baseMimeType

export type MinimalNFT = {
  id: string
  name: string
  sn?: string
  description?: string
  metadata: string
  meta: BaseNFTMeta
} & ItemResources

export type TokenEntity = {
  id: string
  name: string
  image: string
  media?: string
  metadata: string
  meta: BaseNFTMeta
  supply: number
  cheapest: {
    id: string
    price: string
    currentOwner: string
  }
  collection: {
    id: string
    name: string
    floorPrice: [{ price: string }]
  }
}

export type NFTOffer = {
  id: string
  price: string
  expiration: number
  status: string
}

export const isTokenEntity = (
  entity: NFTWithMetadata | TokenEntity,
): entity is TokenEntity =>
  typeof (entity as TokenEntity).supply !== 'undefined'

function getAttributes(nft, metadata) {
  const hasMetadataAttributes
    = metadata.attributes && metadata.attributes.length > 0
  const attr = unionBy(
    nft?.attributes?.concat(...(nft?.meta?.attributes || [])),
    item => item.trait_type || item.key,
  )
  const hasEmptyNftAttributes = attr.length === 0

  return hasMetadataAttributes && hasEmptyNftAttributes
    ? metadata.attributes
    : attr
}

async function getGeneralMetadata<T extends NFTWithMetadata>(nft: T) {
  let name = nft.name || nft.meta.name
  let description = nft.description || nft.meta.description
  let image = sanitizeIpfsUrl(nft.meta.image)
  let animationUrl = sanitizeIpfsUrl(
    nft.meta.animation_url || nft.meta.animationUrl || '',
  )
  let type = nft.meta.type

  if (nft.metadata !== nft.meta.id && nft.metadata) {
    const metadataUrl = sanitizeIpfsUrl(nft.metadata)
    const res = await getMetadata(metadataUrl)

    name = res.name
    description = res.description
    image = sanitizeIpfsUrl(res.image)
    animationUrl = sanitizeIpfsUrl(res.animationUrl)
    type = res.type
  }

  return {
    ...nft,
    name: nameWithIndex(name, nft.sn) || nft.id,
    description,
    image,
    animationUrl,
    type: type || '',
    attributes: getAttributes(nft, nft.metadata || nft.meta),
  }
}

export function useNftCardIcon<
  T extends {
    meta: {
      animationUrl?: string
    }
  },
>(nft: Ref<T>) {
  const isAudio = ref(false)
  const { unlockableIcon } = useIcon()

  const cardIcon = computed(() => {
    if (isAudio) {
      return '/sound.svg'
    }
    return unlockableIcon.value
  })

  watchEffect(async () => {
    const { isAudio: audio } = await useNftMimeType(nft)
    isAudio.value = audio
  })

  return { showCardIcon: isAudio, cardIcon }
}

export async function useNftMimeType<
  T extends {
    meta: {
      animationUrl?: string
    }
  },
>(nft?: Ref<T>) {
  if (!nft?.value.meta?.animationUrl) {
    return {
      isAudio: false,
    }
  }

  const mimeType = await getMimeType(
    sanitizeIpfsUrl(nft.value.meta.animationUrl),
  )

  return {
    isAudio: isAudioMimeType(mimeType),
  }
}

async function getRmrk2Resources<T extends NFTWithMetadata>(nft: T) {
  const thumb = nft.resources?.[0]?.thumb
  const src = nft.resources?.[0]?.src
  const image = sanitizeIpfsUrl(thumb || src || '')
  const type = await getMimeType(image)

  return {
    ...(await getGeneralMetadata(nft)),
    image,
    type,
  }
}

async function getProcessMetadata<T extends NFTWithMetadata>(nft: T) {
  const metadata = await processSingleMetadata<NFTMetadata>(nft.metadata)
  const image = sanitizeIpfsUrl(
    metadata.image || metadata.mediaUri || metadata.thumbnailUri || '',
  )
  const animationUrl = sanitizeIpfsUrl(metadata.animation_url || '')

  return {
    ...nft,
    name:
      nameWithIndex(nft.name || metadata.name, nft.sn || metadata.sn) || nft.id,
    description: nft.description || metadata.description || '',
    image,
    animationUrl,
    type: metadata.type || '',
    attributes: getAttributes(nft, metadata),
  }
}

export async function getNftMetadata<T extends NFTWithMetadata>(
  nft: T,
  prefix: string,
  unify = false,
) {
  const ignoreMetadata = [DYNAMIC_METADATA, 'dyndata']
  const checkMetadata = ignoreMetadata.some(item =>
    (nft.metadata || nft.meta?.id)?.includes(item),
  )
  if (unify && !checkMetadata) {
    return await getMetadata(sanitizeIpfsUrl(nft.metadata || nft.meta.id))
  }

  // if subsquid already give us the metadata, we don't need to fetch it again
  if (nft.meta?.image) {
    return await getGeneralMetadata(nft)
  }

  // if it's rmrk2, we need to check `resources` field
  if (prefix === 'ksm' && nft.resources?.length) {
    return await getRmrk2Resources(nft)
  }

  return await getProcessMetadata(nft)
}

export default function useNftMetadata<T extends NFTWithMetadata>(nft: T) {
  const item = ref<
    T & {
      name: string
      description: string
      image: string
      animationUrl: string
      type: string
      attributes: unknown
    }
  >()
  const { urlPrefix } = usePrefix()

  onMounted(async () => {
    item.value = await getNftMetadata(nft, urlPrefix.value)
  })

  return {
    nft: computed(() => item.value),
  }
}
