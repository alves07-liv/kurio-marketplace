import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Socket } from 'socket.io-client'
import type { ResourceEvent } from '../mocks/events'

export function LiveUpdates({ userId }: { userId?: string }) {
  const client = useQueryClient()
  useEffect(() => {
    let socket: Socket | undefined
    let cancelled = false
    const versions = new Map<string, number>()
    const seen = new Set<string>()
    function accept(type: string, event: ResourceEvent) {
      if (seen.has(event.eventId) || event.version <= (versions.get(`${type}:${event.id}`) || 0)) return false
      seen.add(event.eventId)
      versions.set(`${type}:${event.id}`, event.version)
      return true
    }
    async function connect() {
    const { io } = await import('socket.io-client')
    if (cancelled) return
    socket = io(location.origin, { transports: ['websocket'], path: '/socket.io/' })
    socket.on('nft.updated', (event: ResourceEvent) => {
      if (!accept('nft', event)) return
      client.invalidateQueries({ queryKey: ['nfts'] })
      client.invalidateQueries({ queryKey: ['nft', event.id] })
      client.invalidateQueries({ queryKey: ['quote'] })
      client.invalidateQueries({ queryKey: ['cart'] })
    })
    socket.on('order.updated', (event: ResourceEvent) => {
      if (!accept('order', event)) return
      client.invalidateQueries({ queryKey: ['order', event.id] })
      client.invalidateQueries({ queryKey: ['orders'] })
      client.invalidateQueries({ queryKey: ['cart'] })
    })
    socket.on('connect', () => {
      client.invalidateQueries({ queryKey: ['nfts'] })
      client.invalidateQueries({ queryKey: ['cart'] })
      if (userId) client.invalidateQueries({ queryKey: ['orders'] })
    })
    }
    connect()
    return () => { cancelled = true; socket?.removeAllListeners(); socket?.disconnect() }
  }, [client, userId])
  return null
}
