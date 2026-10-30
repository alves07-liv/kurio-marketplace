import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { endpoints } from '../api'
import { Button } from '../components/ui/button'

export function Checkout() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const { data: user, isPending } = useQuery({ queryKey: ['session'], queryFn: endpoints.session })
  const { data: cart } = useQuery({ queryKey: ['cart', user?.id], queryFn: endpoints.cart, enabled: !!user })
  const { data: quote, refetch } = useQuery({ queryKey: ['quote', cart], queryFn: endpoints.quote, enabled: !!cart })
  const { data: wallets } = useQuery({ queryKey: ['wallets', user?.id], queryFn: endpoints.wallets, enabled: !!user })
  const [walletId, setWalletId] = useState('')
  const [provider, setProvider] = useState('MetaMask')
  const [key, setKey] = useState(() => sessionStorage.getItem('kurio-order-key') || crypto.randomUUID())
  const [notice, setNotice] = useState('')
  const order = useMutation({
    mutationFn: () => endpoints.placeOrder(walletId, quote!.version, key, provider),
    onSuccess: result => {
      sessionStorage.removeItem('kurio-order-key')
      client.invalidateQueries({ queryKey: ['cart'] })
      navigate({ to: '/orders/$id', params: { id: result.id } })
    },
    onError: async error => {
      if (isAxiosError(error) && error.response?.status === 409) {
        await refetch()
        setNotice('Os valores mudaram. Revise o novo total e confirme novamente.')
        const nextKey = crypto.randomUUID()
        sessionStorage.setItem('kurio-order-key', nextKey)
        setKey(nextKey)
      } else if (isAxiosError(error) && error.response?.status === 504) {
        try {
          const saved = await endpoints.orderByKey(key)
          sessionStorage.removeItem('kurio-order-key')
          navigate({ to: '/orders/$id', params: { id: saved.id } })
        } catch {
          setNotice('A conexão caiu. Confira seus pedidos antes de tentar novamente.')
        }
      } else setNotice('Não foi possível confirmar. Confira seus pedidos antes de tentar novamente.')
    },
  })
  if (isPending) return <main><div className="skeleton" /></main>
  if (!user) return <main><h1>Entre para continuar</h1><Link to="/login">Entrar</Link></main>
  return <main className="checkout"><div className="mobile-checkout"><div className="mobile-checkout-title"><Link to="/cart" aria-label="Voltar ao carrinho">‹</Link><h1>Pagamento com carteira</h1></div><div className="mobile-checkout-subtitle"><h2>Carteira conectada</h2><Link to="/wallets">Trocar carteira</Link></div>{wallets?.map(wallet => <label className="mobile-wallet" key={wallet.id}><input type="radio" name="mobile-wallet" checked={walletId === wallet.id} onChange={() => setWalletId(wallet.id)} /><span><strong>{wallet.name}</strong><small>{wallet.address.slice(0, 8)}…<br />Rede {wallet.network}</small></span></label>)}<h2>Carteira e rede</h2>{['WalletConnect', 'MetaMask', 'Coinbase Wallet'].map(name => <label className="mobile-provider" key={name}><span>{name === 'Coinbase Wallet' ? '◉' : name[0]}</span>{name}<input type="radio" name="provider-mobile" checked={provider===name} onChange={()=>setProvider(name)} /></label>)}<p className="mobile-total">Total: <b>{quote?.total} ETH</b></p>{notice && <p role="alert">{notice}</p>}<Button disabled={!walletId || !quote?.lines.length || order.isPending} onClick={() => { sessionStorage.setItem('kurio-order-key', key); setNotice(''); order.mutate() }}>{order.isPending ? 'Processando...' : 'Confirmar compra'}</Button></div><p className="breadcrumb">Início / Mercado / Pagamento</p><div className="checkout-layout">
    <section><h2>Perfil do colecionador</h2><div className="checkout-fields"><p>Nome de exibição: {user.displayName}</p><p>Nome de usuário: {user.username}</p><p>E-mail: {user.email}</p><p>Rede: {wallets?.find(wallet => wallet.id === walletId)?.network || 'Selecione uma carteira'}</p><p>Endereço: {wallets?.find(wallet => wallet.id === walletId)?.address || 'Selecione uma carteira'}</p></div><p><Link to="/profile">Editar perfil</Link> · <Link to="/wallets">Editar carteiras</Link></p>
      {wallets?.length ? wallets.map(wallet => <label className="wallet-option" key={wallet.id}><input type="radio" name="wallet" checked={walletId === wallet.id} onChange={() => setWalletId(wallet.id)} />{wallet.name} · {wallet.network} · {wallet.address.slice(0, 8)}…</label>) : <p>Cadastre uma carteira antes de pagar. <Link to="/wallets">Adicionar carteira</Link></p>}
    </section>
    <aside><h2>Seus NFTs</h2>{quote?.lines.map(line => <div className="quote-line" key={line.nft.id}><img src={line.nft.image} alt="" /><span>{line.nft.title} × {line.quantity}</span><b>{line.subtotal} ETH</b></div>)}<p>Subtotal <b>{quote?.subtotal} ETH</b></p><p>Desconto <b>{quote?.discount} ETH</b></p><p>Taxa de rede <b>{quote?.fee} ETH</b></p><h2>Total <b>{quote?.total} ETH</b></h2><label>Provedor da carteira<select value={provider} onChange={event=>setProvider(event.target.value)}><option>WalletConnect</option><option>MetaMask</option><option>Coinbase Wallet</option></select></label>
      {notice && <p role="alert">{notice}</p>}
      <Button disabled={!walletId || !quote?.lines.length || order.isPending} onClick={() => { sessionStorage.setItem('kurio-order-key', key); setNotice(''); order.mutate() }}>{order.isPending ? 'Processando...' : 'Confirmar compra'}</Button>
    </aside>
  </div></main>
}
