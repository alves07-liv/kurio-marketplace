import { useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../api'

export function Order() {
  const { id } = useParams({ from: '/orders/$id' })
  const { data: order, isPending, isError, refetch } = useQuery({ queryKey: ['order', id], queryFn: () => endpoints.order(id), refetchInterval: result => result.state.data?.status === 'pending' ? 2000 : false })
  if (isPending) return <main><div className="skeleton" /></main>
  if (isError || !order) return <main role="alert"><h1>Pedido não encontrado</h1><button onClick={() => refetch()}>Tentar novamente</button></main>
  return <main className="receipt-page"><section className="receipt"><Link to="/" className="receipt-close" aria-label="Fechar">×</Link><div className="receipt-top"><span className="receipt-icon">✓</span><h1>{order.status === 'confirmed' ? 'Seus NFTs agora estão na sua carteira' : order.status === 'pending' ? 'Pagamento pendente' : 'Pagamento recusado'}</h1></div><div className="receipt-meta"><span>ID da transação<br />{order.id.slice(0, 12)}</span><span>Data<br />{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span><span>Total<br />{order.quote.total} ETH</span><span>Carteira<br />{order.wallet.name}</span></div><div className="receipt-body"><h2>Detalhes da transação</h2>{order.quote.lines.map(line => <div className="quote-line" key={line.nft.id}><img src={line.nft.image} alt="" /><span>{line.nft.title} × {line.quantity}</span><b>{line.subtotal} ETH</b></div>)}<p>Taxa de rede: {order.quote.fee} ETH</p><h2>Total: {order.quote.total} ETH</h2><p>{order.status === 'confirmed' ? `Transação confirmada na ${order.wallet.network}. A propriedade foi registrada na carteira conectada.` : order.status === 'pending' ? 'Acompanhe esta página para receber a confirmação.' : 'Os itens permanecem no carrinho para uma nova tentativa.'}</p><Link className="button" to="/">Voltar ao mercado</Link></div></section></main>
}
