import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../api'
import { NftCard } from '../components/NftCard'
export function Favorites(){const {data:ids,isError}=useQuery({queryKey:['favorites'],queryFn:endpoints.favorites});const {data:page}=useQuery({queryKey:['nfts','favorites'],queryFn:()=>endpoints.nfts(new URLSearchParams())});return <main><h1>Lista de interesse</h1>{isError?<Link to="/login">Entre para ver seus favoritos</Link>:ids?.length?<div className="grid">{page?.items.filter(n=>ids.includes(n.id)).map(n=><NftCard nft={n} key={n.id}/>)}</div>:<p>Nenhum favorito ainda.</p>}</main>}
export function Orders(){const {data:orders,isError}=useQuery({queryKey:['orders'],queryFn:endpoints.orders});return <main><h1>Pedidos</h1>{isError?<Link to="/login">Entre para ver seus pedidos</Link>:orders?.length?orders.map(o=><p key={o.id}><Link to="/orders/$id" params={{id:o.id}}>{o.id} · {o.status} · {o.quote.total} ETH</Link></p>):<p>Nenhum pedido ainda.</p>}</main>}
