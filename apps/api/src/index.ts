import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { workspaces } from './routes/workspaces';
import { folders } from './routes/folders';
import { lists } from './routes/lists';
import { tasks } from './routes/tasks';
import { comments } from './routes/comments';
import { uploads } from './routes/uploads';
import { errorHandler } from './middleware/error';

export type Env = {
  DB: D1Database;
  ASSETS: R2Bucket;
  SYNC_DOC: DurableObjectNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());
app.onError(errorHandler);

app.get('/', (c) => c.json({ name: 'MarketFlow API', status: 'ok' }));

app.route('/auth', auth);
app.route('/workspaces', workspaces);
app.route('/folders', folders);
app.route('/lists', lists);
app.route('/tasks', tasks);
app.route('/comments', comments);
app.route('/uploads', uploads);

// WebSocket upgrade → Durable Object per task
app.get('/ws/task/:id', async (c) => {
  const id = c.req.param('id');
  const doId = c.env.SYNC_DOC.idFromName(id);
  const stub = c.env.SYNC_DOC.get(doId);
  return stub.fetch(c.req.raw);
});

export default app;
export { SyncDocRoom } from './durable-objects/SyncDocRoom';
