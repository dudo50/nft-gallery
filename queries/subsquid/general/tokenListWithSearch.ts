import { graphql } from '@/queries/clients/graphqlClients'

export default graphql(`
query tokenListWithSearch(
  $first: Int!
  $offset: Int
  $orderBy: [String!] = ["blockNumber_DESC"]
  $price_gte: Float
  $price_gt: Float
  $price_lte: Float
  $owner: String
  $issuer: String
  $denyList: [String!]
  $collections: [String!]
  $name: String
) {
  tokenEntities: tokenEntityList(
    owner: $owner
    issuer: $issuer
    denyList: $denyList
    orderBy: $orderBy
    limit: $first
    offset: $offset
    price_gte: $price_gte
    price_gt: $price_gt
    price_lte: $price_lte
    collections: $collections
    name: $name
  ) {
    id
    name
    image
    media
    metadata
    supply
    cheapest {
      id
      price
      currentOwner
    }
    collection {
      id
      name
    }
    meta {
      id
      image
      animationUrl
      description
    }
  }
  tokenEntityCount(
    owner: $owner
    issuer: $issuer
    denyList: $denyList
    price_gte: $price_gte
    price_gt: $price_gt
    price_lte: $price_lte
    collections: $collections
    name: $name
  ) {
    totalCount
  }
}
`)
