export type Network = 'Ethereum' | 'Polygon' | 'Solana'
export interface Nft { id: string; title: string; price: string; collection: string; network: Network; image: string; available: number; version: number }
export interface User { id: string; email: string; username: string; displayName: string; avatar?: string; ens?: string }
export interface CartItem { nftId: string; edition: string; quantity: number }
export interface Cart { items: CartItem[]; coupon?: string }
export interface QuoteLine { nft: Nft; edition: string; quantity: number; subtotal: string }
export interface Quote { lines: QuoteLine[]; subtotal: string; discount: string; fee: string; total: string; version: string }
export interface Wallet { id: string; name: string; address: string; network: Network; primary: boolean }
export interface Order { id: string; userId: string; status: 'pending' | 'confirmed' | 'declined'; quote: Quote; wallet: Wallet; provider: string; createdAt: string; version: number }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
