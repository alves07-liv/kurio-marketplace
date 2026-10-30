import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '../api'
import type { Network } from '../contracts'

export function Wallets() {
  const client = useQueryClient()
  const { data: wallets, isPending, isError } = useQuery({ queryKey: ['wallets'], queryFn: endpoints.wallets })
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<Network>('Ethereum')
  const [primary, setPrimary] = useState(false)
  const refresh = () => client.invalidateQueries({ queryKey: ['wallets'] })
  const add = useMutation({ mutationFn: () => endpoints.saveWallet({ name, address, network, primary }), onSuccess: () => { refresh(); setName(''); setAddress('') } })
  const choose = useMutation({ mutationFn: endpoints.setPrimaryWallet, onSuccess: refresh })
  return <main className="account-page"><aside><h2>Meu perfil</h2><Link to="/profile">Dados do perfil</Link><Link to="/wallets">Carteiras</Link></aside><section><h1>Carteiras</h1>
    {isPending ? <div className="skeleton" /> : isError ? <Link to="/login">Entre para acessar suas carteiras</Link> : wallets?.length ? wallets.map(wallet => <div className="wallet-option" key={wallet.id}>{wallet.name} · {wallet.network} · {wallet.address} {wallet.primary ? '(principal)' : <button disabled={choose.isPending} onClick={() => choose.mutate(wallet.id)}>Definir como principal</button>}</div>) : <p>Você ainda não adicionou uma carteira.</p>}
    <h2>Adicionar carteira</h2><form onSubmit={event => { event.preventDefault(); add.mutate() }}><label>Apelido da carteira<input required value={name} onChange={event => setName(event.target.value)} /></label><label>Endereço da carteira<input required pattern="0x[a-fA-F0-9]{40}" value={address} onChange={event => setAddress(event.target.value)} /></label><label>Rede<select value={network} onChange={event => setNetwork(event.target.value as Network)}><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></label><label><input type="checkbox" checked={primary} onChange={event => setPrimary(event.target.checked)} /> Carteira principal</label><button>Salvar carteira</button>{add.isError && <p role="alert">Endereço inválido.</p>}{choose.isError && <p role="alert">Não foi possível alterar a carteira principal.</p>}</form>
  </section></main>
}
