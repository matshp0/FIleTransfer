import signalingServer from '../plugins/signalingServer.js';
export const autoPrefix = '/api';

export default async function api(fastify) {
  fastify.register(signalingServer);
  fastify.get('/hello', async (request, reply) => {
    reply.send({ hello: 'world' });
  });
}
