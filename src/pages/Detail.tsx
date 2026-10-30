import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { endpoints } from '../api'
import { NftCard } from '../components/NftCard'

export function Detail() {
  const { id } = useParams({ from: '/nft/$id' })
  const client = useQueryClient()
  const navigate = useNavigate()
  const { data: nft, isPending, isError } = useQuery({ queryKey: ['nft', id], queryFn: () => endpoints.nft(id) })
  const { data: user } = useQuery({ queryKey: ['session'], queryFn: endpoints.session })
  const { data: cart } = useQuery({ queryKey: ['cart', user?.id], queryFn: endpoints.cart })
  const { data: favorites } = useQuery({ queryKey: ['favorites'], queryFn: endpoints.favorites, enabled: !!user })
  const { data: related } = useQuery({ queryKey: ['nfts', 'related', nft?.collection], queryFn: () => endpoints.nfts(new URLSearchParams({ collection: nft!.collection })), enabled: !!nft })
  const [quantity, setQuantity] = useState(1)
  const [edition, setEdition] = useState('1/50')
  const [imageIndex, setImageIndex] = useState(0)
  const add = useMutation({
    mutationFn: () => endpoints.saveCart({ items: [...(cart?.items || []).filter(item => item.nftId !== id || item.edition !== edition), { nftId: id, edition, quantity: (cart?.items.find(item => item.nftId === id && item.edition === edition)?.quantity || 0) + quantity }] }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['cart'] }),
  })
  const favorite = useMutation({
    mutationFn: () => endpoints.favorite(id),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: ['favorites'] })
      const previous = client.getQueryData<string[]>(['favorites']) || []
      client.setQueryData<string[]>(['favorites'], previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id])
      return previous
    },
    onError: (_error, _variables, previous) => client.setQueryData(['favorites'], previous),
    onSettled: () => client.invalidateQueries({ queryKey: ['favorites'] }),
  })
  if (isPending) return <main><div className="skeleton" /></main>
  if (isError || !nft) return <main><h1>NFT não encontrado</h1><Link to="/">Voltar ao mercado</Link></main>
  return <main className="detail">
    <Link to="/">Início / Mercado</Link>
    <div className="detail-grid">
      <div className="nft-gallery"><img src={imageIndex === 0 ? nft.image : related?.items.filter(item => item.id !== nft.id)[imageIndex - 1]?.image || nft.image} alt={`${nft.title}, imagem ${imageIndex + 1}`} width={600} height={600} /><div className="nft-thumbnails">{[nft,...(related?.items.filter(item => item.id !== nft.id).slice(0,3) || [])].map((item,index)=><button key={item.id} type="button" aria-label={`Ver imagem ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><img src={item.image} alt="" /></button>)}</div></div>
      <div>
        <h1>{nft.title}</h1>
        <strong>{nft.price} ETH</strong>
        <p>Um colecionável digital da coleção Kurio Editions, verificado na {nft.network}.</p>
        <label>Edição <select value={edition} onChange={event => setEdition(event.target.value)}><option>1/1</option><option>1/10</option><option>1/50</option><option>ABERTA</option></select></label>
        <div className="quantity"><button aria-label="Diminuir quantidade" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><output>{quantity}</output><button aria-label="Aumentar quantidade" onClick={() => setQuantity(Math.min(nft.available, quantity + 1))}>+</button></div>
        <p>Disponíveis: {nft.available}</p>
        <div className="flex items-center gap-3">
          <button disabled={!nft.available || add.isPending} onClick={() => add.mutate()}>Adicionar ao carrinho</button>
          <button aria-label={favorites?.includes(id) ? 'Remover dos favoritos' : 'Favoritar'} aria-pressed={!!favorites?.includes(id)} onClick={() => user ? favorite.mutate() : (sessionStorage.setItem('kurio-return-to', `/nft/${id}`), navigate({ to: '/login' }))}><Heart fill={favorites?.includes(id) ? 'currentColor' : 'none'} /></button>
        </div>
        {add.isSuccess && <p role="status">Adicionado ao carrinho.</p>}
        {add.isError && <p role="alert">Quantidade indisponível. Atualize o carrinho.</p>}
        {favorite.isError && <p role="alert">Não foi possível atualizar os favoritos.</p>}
        <p>ID do token: #{nft.id}</p><p>Rede: {nft.network}</p>
      </div>
    </div>
    <section className="nft-information"><h2>Detalhes do NFT</h2><p>{nft.title} é uma edição digital da coleção {nft.collection}, publicada na rede {nft.network}. A obra combina retrato, identidade e cultura digital em uma peça para colecionadores.</p><h3>Propriedades</h3><p>Coleção: {nft.collection} · Rede: {nft.network} · Edições disponíveis: {nft.available}</p><h3>Contrato</h3><p>Identificador do token: #{nft.id} · Padrão de token: ERC-721 (simulado para demonstração)</p><h3>Histórico</h3><p>Preço atual: {nft.price} ETH. A compra e a transferência são simuladas nesta prévia.</p></section>
    <h2>Mais desta coleção</h2><div className="grid related-grid">{related?.items.filter(item => item.id !== nft.id).slice(0, 5).map(item => <NftCard nft={item} key={item.id} />)}</div>
  </main>
}
