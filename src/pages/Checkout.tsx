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
  const [key, setKey] = useState(() => sessionStorage.getItem('kurio-order-key') || crypto.randomUUID())
  const [notice, setNotice] = useState('')
  const order = useMutation({
    mutationFn: () => endpoints.placeOrder(walletId, quote!.version, key),
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
  return <main className="checkout"><div className="mobile-checkout"><div className="mobile-checkout-title"><Link to="/cart" aria-label="Voltar ao carrinho">‹</Link><h1>Pagamento com carteira</h1></div><div className="mobile-checkout-subtitle"><h2>Carteira conectada</h2><Link to="/wallets">Trocar carteira</Link></div>{wallets?.map(wallet => <label className="mobile-wallet" key={wallet.id}><input type="radio" name="mobile-wallet" checked={walletId === wallet.id} onChange={() => setWalletId(wallet.id)} /><span><strong>{wallet.name}</strong><small>{wallet.address.slice(0, 8)}…<br />Rede {wallet.network}</small></span></label>)}<h2>Carteira e rede</h2>{['WalletConnect', 'MetaMask', 'Coinbase Wallet'].map(name => <div className="mobile-provider" key={name}><span>{name === 'Coinbase Wallet' ? '◉' : name[0]}</span>{name}</div>)}<p className="mobile-total">Total: <b>{quote?.total} ETH</b></p>{notice && <p role="alert">{notice}</p>}<Button disabled={!walletId || !quote?.lines.length || order.isPending} onClick={() => { sessionStorage.setItem('kurio-order-key', key); setNotice(''); order.mutate() }}>{order.isPending ? 'Processando...' : 'Confirmar compra'}</Button></div><p className="breadcrumb">Início / Mercado / Pagamento</p><div className="checkout-layout">
    <section><h2>Perfil do colecionador</h2><div className="checkout-fields"><label>Nome de exibição<input defaultValue={user.displayName} required /></label><label>Nome de usuário<input defaultValue={user.username} required /></label><label>Rede<select defaultValue="Ethereum"><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label><label>Nome do perfil<input defaultValue={user.displayName} /></label><label>Endereço da carteira<input placeholder="Endereço 0x da carteira" defaultValue={wallets?.find(wallet => wallet.id === walletId)?.address || ''} /></label><label>ENS ou carteira secundária<input placeholder="Opcional" /></label><label>Tipo de carteira<select defaultValue="Principal"><option>Principal</option><option>Secundária</option></select></label><label>Código de indicação<input placeholder="Opcional" /></label><label>E-mail<input type="email" defaultValue={user.email} required /></label><label>Nome ENS<input placeholder=".eth" /></label></div><p>Usar outra carteira? <Link to="/wallets">Adicionar carteira</Link></p><label>Observação do colecionador (opcional)<textarea rows={5} /></label>
      {wallets?.length ? wallets.map(wallet => <label className="wallet-option" key={wallet.id}><input type="radio" name="wallet" checked={walletId === wallet.id} onChange={() => setWalletId(wallet.id)} />{wallet.name} · {wallet.network} · {wallet.address.slice(0, 8)}…</label>) : <p>Cadastre uma carteira antes de pagar. <Link to="/wallets">Adicionar carteira</Link></p>}
    </section>
    <aside><h2>Seus NFTs</h2>{quote?.lines.map(line => <div className="quote-line" key={line.nft.id}><img src={line.nft.image} alt="" /><span>{line.nft.title} × {line.quantity}</span><b>{line.subtotal} ETH</b></div>)}<p>Subtotal <b>{quote?.subtotal} ETH</b></p><p>Desconto <b>{quote?.discount} ETH</b></p><p>Taxa de rede <b>{quote?.fee} ETH</b></p><h2>Total <b>{quote?.total} ETH</b></h2><p>Carteira e rede</p>
      {notice && <p role="alert">{notice}</p>}
      <Button disabled={!walletId || !quote?.lines.length || order.isPending} onClick={() => { sessionStorage.setItem('kurio-order-key', key); setNotice(''); order.mutate() }}>{order.isPending ? 'Processando...' : 'Confirmar compra'}</Button>
    </aside>
  </div></main>
}
