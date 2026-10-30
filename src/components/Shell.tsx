import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, Home, Search, ShoppingCart, UserRound } from 'lucide-react'
import { endpoints } from '../api'
import { LiveUpdates } from './LiveUpdates'

export function Shell() {
  const { data: user } = useQuery({ queryKey: ['session'], queryFn: endpoints.session })
  const { data: cart } = useQuery({ queryKey: ['cart', user?.id], queryFn: endpoints.cart })
  const client = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    function expired() {
      const path = location.pathname
      if (path !== '/login' && path !== '/register') sessionStorage.setItem('kurio-return-to', path)
      client.clear()
      navigate({ to: '/login' })
    }
    window.addEventListener('kurio-session-expired', expired)
    return () => window.removeEventListener('kurio-session-expired', expired)
  }, [client, navigate])

  async function logout() {
    await endpoints.logout()
    localStorage.removeItem('kurio-token')
    client.clear()
    navigate({ to: '/' })
  }

  return <>
    <LiveUpdates userId={user?.id} />
    <header className="site-header">
      <Link to="/" className="brand">KURIO</Link>
      <nav aria-label="Navegação principal">
        <Link to="/">Início</Link>
        <a href="/#catalogo">Mercado</a>
        <a href="/#criadores">Criadores</a>
        <a href="/#aprenda">Aprenda</a>
      </nav>
      <div className="head-actions">
        <a href="/#catalogo" aria-label="Buscar NFTs"><Search size={18} /></a>
        <Link to="/cart" aria-label={`Carrinho, ${cart?.items.length || 0} itens`}><ShoppingCart size={19} />{Boolean(cart?.items.length) && <span className="cart-count">{cart?.items.length}</span>}</Link>
        {user ? <><Link to="/profile" className="header-user">{user.username}</Link><button onClick={logout}>Sair</button></> : <Link className="button" to="/login">Entrar</Link>}
      </div>
    </header>
    <Outlet />
    <footer className="site-footer">
      <div className="footer-features">
        <section><b>W</b><h3>Segurança da carteira</h3><p>Proteja sua carteira e colecione arte digital verificada com confiança.</p></section>
        <section><b>C</b><h3>Criadores em destaque</h3><p>Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.</p></section>
        <section><b>D</b><h3>Alertas de lançamentos</h3><p>Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.</p></section>
        <section className="footer-news"><h3>Antecipe-se ao próximo lançamento</h3><form onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const email = form.querySelector('input'); if (email?.value) { form.reset(); alert('Inscrição recebida!') } }}><input type="email" required placeholder="digite seu e-mail..." aria-label="Receber novidades"/><button className="button">Enviar</button></form><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></section>
      </div>
      <div className="footer-band"><strong>KURIO</strong><span>Feito para colecionadores, criadores e cultura</span><a href="mailto:contato@email.com">contato@email.com</a><span>+55 11 4082 8922</span></div>
      <div className="footer-links">
        <section><h3>Meu perfil</h3><Link to="/profile">Meu perfil</Link><Link to="/profile">Minha coleção</Link><Link to="/profile">Atividade</Link><Link to="/favorites">Lista de interesse</Link></section>
        <section><h3>Central de ajuda</h3><a href="mailto:contato@email.com">Central de ajuda</a><a href="mailto:contato@email.com?subject=Como%20comprar%20NFTs">Como comprar NFTs</a><a href="mailto:contato@email.com?subject=Carteira%20e%20seguran%C3%A7a">Carteira e segurança</a><a href="mailto:contato@email.com?subject=Pol%C3%ADticas%20do%20mercado">Políticas do mercado</a></section>
        <section><h3>Coleções</h3><a href="/#catalogo">Arte digital</a><a href="/#catalogo">Fotografia</a><a href="/#catalogo">Música</a><a href="/#catalogo">Arte 3D</a><a href="/#catalogo">Utilidade</a></section>
        <section><h3>Redes sociais</h3><div className="social-icons"><span>f</span><span>◎</span><span>𝕏</span><span>in</span><span>▶</span></div><h3>Carteiras compatíveis</h3><div className="wallet-badges">METAMASK · WALLETCONNECT · COINBASE</div></section>
      </div>
      <small>© 2026 Kurio. Propriedade digital para todos.</small>
    </footer>
    <div className="mobile-nav"><Link to="/" aria-label="Início"><Home /></Link><Link to="/favorites" aria-label="Favoritos"><Heart /></Link><Link to="/cart" aria-label="Carrinho"><ShoppingCart /></Link><Link to="/profile" aria-label="Perfil"><UserRound /></Link></div>
  </>
}

