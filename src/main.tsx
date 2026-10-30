import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routes'
import './style.css'
const client = new QueryClient()
const router = createRouter({routeTree})
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
async function start(){
 const {worker}=await import('./mocks/browser')
 await worker.start()
 createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}><RouterProvider router={router}/></QueryClientProvider></React.StrictMode>)
}
start()
