import { createRootRoute, createRoute } from '@tanstack/react-router'
import { Shell } from './components/Shell'
import { Home } from './pages/Home'
import { Detail } from './pages/Detail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Order } from './pages/Order'
import { Profile } from './pages/Profile'
import { Wallets } from './pages/Wallets'
import { Account } from './pages/Account'
import { Favorites, Orders } from './pages/Lists'
const root=createRootRoute({component:Shell})
interface HomeSearch {q?:string;collection?:string;network?:string;sort?:string;tab?:string;page?:number}
const home=createRoute({getParentRoute:()=>root,path:'/',validateSearch:(search:Record<string,unknown>):HomeSearch=>({q:typeof search.q==='string'?search.q:undefined,collection:typeof search.collection==='string'?search.collection:undefined,network:typeof search.network==='string'?search.network:undefined,sort:typeof search.sort==='string'?search.sort:undefined,tab:typeof search.tab==='string'?search.tab:undefined,page:Number(search.page)||1}),component:Home})
const detail=createRoute({getParentRoute:()=>root,path:'/nft/$id',component:Detail})
const cart=createRoute({getParentRoute:()=>root,path:'/cart',component:Cart})
const checkout=createRoute({getParentRoute:()=>root,path:'/checkout',component:Checkout})
const order=createRoute({getParentRoute:()=>root,path:'/orders/$id',component:Order})
const orders=createRoute({getParentRoute:()=>root,path:'/orders',component:Orders})
const login=createRoute({getParentRoute:()=>root,path:'/login',component:()=> <Account mode="login"/>})
const register=createRoute({getParentRoute:()=>root,path:'/register',component:()=> <Account mode="register"/>})
const profile=createRoute({getParentRoute:()=>root,path:'/profile',component:Profile})
const wallets=createRoute({getParentRoute:()=>root,path:'/wallets',component:Wallets})
const favorites=createRoute({getParentRoute:()=>root,path:'/favorites',component:Favorites})
export const routeTree=root.addChildren([home,detail,cart,checkout,order,orders,login,register,profile,wallets,favorites])

