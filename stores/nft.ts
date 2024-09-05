import { defineStore } from 'pinia'
import type { NFTMetadata } from '@/services/oda'
import type { NFT } from '@/components/rmrk/service/scheme'

export const useNftStore = defineStore('nft', {
  state: () => ({
    // data from indexer
    nft: undefined as NFT | undefined,

    // data from oda-worker
    nftMetadata: undefined as NFTMetadata | undefined,
    nftImage: '',
    nftMimeType: '',
    nftAnimation: '',
    nftAnimationMimeType: '',
  }),
})
