import Decimal from 'decimal.js'
import type { Cart, Nft, Order, Quote, User, Wallet } from '../contracts'
import { nfts as fixtures } from '../data/nfts'
interface Account { user: User; passwordHash: string; favorites: string[]; wallets: Wallet[]; orders: Order[] }
interface State { accounts: Account[]; tokens: Record<string,string>; carts: Record<string,Cart>; nfts: Nft[]; idempotency: Record<string,{fingerprint:string;orderId:string}> }
const key='kurio-demo-state-v2'
const joaoAccount:Account={user:{id:'demo-joao',email:'joao@jungle.test',username:'joao',displayName:'João Colecionador'},passwordHash:'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae',favorites:[],wallets:[{id:'wallet-joao',name:'Carteira principal',address:'0x2222222222222222222222222222222222222222',network:'Ethereum',primary:true}],orders:[]}
const initial=():State=>({accounts:[
 {user:{id:'demo-ana',email:'ana@kurio.test',username:'ana',displayName:'Ana Colecionadora'},passwordHash:'c972f1e209dafc6d6323b332a33b064969e27f7c91b560ffbcdffd8a79a3ef55',favorites:[],wallets:[{id:'wallet-ana',name:'Carteira principal',address:'0x1111111111111111111111111111111111111111',network:'Ethereum',primary:true}],orders:[]},
 {user:{id:'demo-bruno',email:'bruno@kurio.test',username:'bruno',displayName:'Bruno Criador'},passwordHash:'34e0ef976b88df454092580bea9112bd07aa98e128a3e57978743d101c578c53',favorites:[],wallets:[],orders:[]},joaoAccount
 ],tokens:{},carts:{guest:{items:[]}},nfts:fixtures.map(n=>({...n,network:n.network as Nft['network'],version:1})),idempotency:{}})
export function read():State {try{const state:State=JSON.parse(localStorage.getItem(key)||'null')||initial();if(!state.accounts.some(a=>a.user.email==='joao@jungle.test')){state.accounts.push(joaoAccount);write(state)}return state}catch{return initial()}}
export function write(state:State){localStorage.setItem(key,JSON.stringify(state))}
export function reset(){localStorage.removeItem(key);localStorage.removeItem('kurio-token');localStorage.removeItem('kurio-scenario');sessionStorage.removeItem('kurio-order-key')}
export function account(state:State,token:string|null){if(new URLSearchParams(location.search).get('scenario')==='session-expired'||localStorage.getItem('kurio-scenario')==='session-expired')return undefined;const id=token?state.tokens[token]:undefined;return state.accounts.find(a=>a.user.id===id)}
export async function hash(password:string){const bytes=new TextEncoder().encode(password);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('')}
export function quote(state:State,cart:Cart):Quote {
 const lines=cart.items.map(item=>{const nft=state.nfts.find(n=>n.id===item.nftId);if(!nft||item.quantity<1||item.quantity>nft.available)throw new Error('Edição indisponível');return {nft,edition:item.edition,quantity:item.quantity,subtotal:new Decimal(nft.price).mul(item.quantity).toFixed(3)}})
 const subtotal=lines.reduce((sum,line)=>sum.plus(line.subtotal),new Decimal(0))
 const discount=cart.coupon==='KURIO10'?subtotal.mul('0.1'):new Decimal(0)
 const fee=lines.length?new Decimal('0.016'):new Decimal(0)
 return {lines,subtotal:subtotal.toFixed(3),discount:discount.toFixed(3),fee:fee.toFixed(3),total:subtotal.minus(discount).plus(fee).toFixed(3),version:JSON.stringify([cart,state.nfts.map(n=>[n.id,n.price,n.available,n.version])])}
}
