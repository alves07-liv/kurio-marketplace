import axios from 'axios'
import type { Cart, Nft, Order, Page, Quote, User, Wallet } from './contracts'
export const api = axios.create({baseURL:'/api',timeout:8000})
api.interceptors.request.use(config=>{const token=localStorage.getItem('kurio-token');if(token)config.headers.Authorization=`Bearer ${token}`;return config})
api.interceptors.response.use(response=>response,error=>{if(axios.isAxiosError(error)&&error.response?.status===401&&localStorage.getItem('kurio-token')){localStorage.removeItem('kurio-token');window.dispatchEvent(new Event('kurio-session-expired'))}return Promise.reject(error)})
export const endpoints={
 session:()=>api.get<User|null>('/session').then(r=>r.data),
 login:(email:string,password:string)=>api.post<{token:string;user:User}>('/session',{email,password}).then(r=>r.data),
 register:(email:string,password:string,username:string)=>api.post<{token:string;user:User}>('/account',{email,password,username}).then(r=>r.data),
 logout:()=>api.delete('/session'),
 nfts:(params:URLSearchParams,signal?:AbortSignal)=>api.get<Page<Nft>>('/nfts',{params,signal}).then(r=>r.data),
 nft:(id:string)=>api.get<Nft>(`/nfts/${id}`).then(r=>r.data),
 favorites:()=>api.get<string[]>('/favorites').then(r=>r.data),
 favorite:(id:string)=>api.post<string[]>('/favorites',{id}).then(r=>r.data),
 cart:()=>api.get<Cart>('/cart').then(r=>r.data),
 saveCart:(cart:Cart)=>api.put<Cart>('/cart',cart).then(r=>r.data),
 quote:()=>api.get<Quote>('/quote').then(r=>r.data),
 orders:()=>api.get<Order[]>('/orders').then(r=>r.data),
 order:(id:string)=>api.get<Order>(`/orders/${id}`).then(r=>r.data),
 orderByKey:(key:string)=>api.get<Order>(`/orders/by-key/${key}`).then(r=>r.data),
 placeOrder:(walletId:string,quoteVersion:string,key:string)=>api.post<Order>('/orders',{walletId,quoteVersion},{headers:{'Idempotency-Key':key}}).then(r=>r.data),
 profile:()=>api.get<User>('/profile').then(r=>r.data),
 saveProfile:(user:Partial<User>&{currentPassword?:string;newPassword?:string})=>api.put<User>('/profile',user).then(r=>r.data),
 wallets:()=>api.get<Wallet[]>('/wallets').then(r=>r.data),
 saveWallet:(wallet:Omit<Wallet,'id'>)=>api.post<Wallet>('/wallets',wallet).then(r=>r.data)
 ,setPrimaryWallet:(id:string)=>api.put<Wallet>(`/wallets/${id}`,{primary:true}).then(r=>r.data)
}
