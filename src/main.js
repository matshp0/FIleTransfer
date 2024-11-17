import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import signalingServer from './plugins/signalingServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWebsocket);
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
});
fastify.register(signalingServer);

fastify.listen(
  { port: process.env.PORT || 8000, host: '0.0.0.0' },
  (err, address) => {
    if (err) {
      throw err;
    }
    console.log(`Server is running on ${address}`);
  }
);
