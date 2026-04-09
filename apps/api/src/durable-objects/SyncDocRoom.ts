import type { Env } from '../index';

/**
 * One Durable Object instance per task. Holds a Y.Doc in memory,
 * broadcasts updates over WebSocket, and persists a snapshot to D1
 * on idle or shutdown.
 */
export class SyncDocRoom {
  state: DurableObjectState;
  env: Env;
  sessions = new Set<WebSocket>();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.accept(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  private accept(ws: WebSocket) {
    ws.accept();
    this.sessions.add(ws);

    ws.addEventListener('message', (event) => {
      // TODO: apply Yjs update to in-memory Y.Doc and broadcast to peers
      for (const peer of this.sessions) {
        if (peer !== ws && peer.readyState === WebSocket.OPEN) {
          peer.send(event.data);
        }
      }
    });

    ws.addEventListener('close', () => this.sessions.delete(ws));
    ws.addEventListener('error', () => this.sessions.delete(ws));
  }
}
