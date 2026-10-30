import { Link } from '@tanstack/react-router'
import type { Nft } from '../contracts'
export function NftCard({nft}:{nft:Nft}){return <article><Link to="/nft/$id" params={{id:nft.id}}><img src={nft.image} alt={nft.title}/><p>{nft.title}</p><b>{nft.price} ETH</b></Link></article>}
