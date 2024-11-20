import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import AutoLoad from '@fastify/autoload';
import { join } from 'desm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWebsocket);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
});

console.log(import.meta.url);
fastify.register(AutoLoad, {
  dir: join(import.meta.url, 'routes'),
  dirNameRoutePrefix: false
});

fastify.listen(
  { port: process.env.PORT || 8000, host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      throw err;
    }
    console.log(`Server is running on ${address}`);
  }
);
