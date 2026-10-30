import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { endpoints } from '../api'
import { Button } from '../components/ui/button'

export function Account({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const client = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirm, setConfirm] = useState('')
  const [socialError, setSocialError] = useState('')
  function finish(token: string) { localStorage.setItem('kurio-token', token); client.clear(); const target = sessionStorage.getItem('kurio-return-to'); sessionStorage.removeItem('kurio-return-to'); navigate({ to: target?.startsWith('/') ? target : '/' }) }
  const action = useMutation({ mutationFn: () => mode === 'login' ? endpoints.login(email, password) : endpoints.register(email, password, username), onSuccess: ({ token }) => finish(token) })
  async function demoLogin(account: 'google' | 'facebook') { try { const result = await endpoints.login(account === 'google' ? 'ana@kurio.test' : 'bruno@kurio.test', account === 'google' ? 'kurio1234' : 'colecionador123'); finish(result.token) } catch { setSocialError('Não foi possível acessar a conta de demonstração.') } }
  const message = isAxiosError(action.error) ? action.error.response?.data?.message : String(action.error || '')
  return <div className="account-overlay"><iframe className="auth-background" src="/" title="Prévia do marketplace" tabIndex={-1} aria-hidden="true" /><div className="auth-shade" /><main className="auth" role="dialog" aria-modal="true" aria-labelledby="account-title"><Link className="auth-close" to="/" aria-label="Fechar">×</Link><p className="auth-switch"><Link to="/login">Entrar</Link> / <Link to="/register">Criar conta</Link></p><h1 id="account-title">{mode === 'login' ? 'Entrar' : 'Criar perfil de colecionador'}</h1><p className="auth-intro">{mode === 'login' ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.' : 'Crie seu perfil de colecionador e conecte sua carteira quando quiser.'}</p><form onSubmit={event => { event.preventDefault(); if (mode === 'register' && password !== confirm) return; action.mutate() }}>
    {mode === 'register' && <label>Nome de usuário<input required minLength={2} value={username} onChange={event => setUsername(event.target.value)} /></label>}
    <label>E-mail<input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
    <label>Senha<input type="password" required minLength={mode === 'register' ? 8 : 1} value={password} onChange={event => setPassword(event.target.value)} /></label>
    {mode === 'register' && <label>Confirmar senha<input type="password" required value={confirm} onChange={event => setConfirm(event.target.value)} /></label>}
    {mode === 'register' && confirm && confirm !== password && <p role="alert">As senhas não coincidem.</p>}{action.isError && <p role="alert">{message}</p>}
    <Button disabled={action.isPending || (mode === 'register' && password !== confirm)}>{action.isPending ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar perfil'}</Button>
  </form><div className="auth-divider">Ou continue com</div><button type="button" className="social-button" onClick={() => demoLogin('google')}>Continuar com Google (demo)</button><button type="button" className="social-button" onClick={() => demoLogin('facebook')}>Continuar com Facebook (demo)</button>{socialError && <p role="alert">{socialError}</p>}<p className="auth-bottom">{mode === 'login' ? <Link to="/register">Novo na Kurio? Crie uma conta</Link> : <Link to="/login">Já tem uma conta? Entre</Link>}</p></main></div>
}
