import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

export interface ResourceEvent { eventId: string; id: string; version: number }
const clients = new Set<ReturnType<typeof toSocketIo>['client']>()
const url = `${location.origin.replace(/^http/, 'ws')}/`
const channel = ws.link(url)

export const socketHandler = channel.addEventListener('connection', connection => {
  const socket = toSocketIo(connection)
  clients.add(socket.client)
  connection.client.addEventListener('close', () => clients.delete(socket.client))
})

export function emitResource(name: 'nft.updated' | 'order.updated', id: string, version: number) {
  const event: ResourceEvent = { eventId: crypto.randomUUID(), id, version }
  clients.forEach(client => client.emit(name, event))
  return event
}
