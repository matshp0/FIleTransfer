import fp from 'fastify-plugin';
import BiMap from 'bidirectional-map';
import WSController from '../scripts/wsServer.js';
import S from 'fluent-json-schema';
import generateKey from '../scripts/generateKey.js';

const signalingServer = async (fastify) => {
  const pairs = new BiMap();
  const hosts = new BiMap();

  const onClose = (socket) => {
    console.log('Connection closed');
    pairs.delete(socket);
    pairs.deleteValue(socket);
    hosts.deleteValue(socket);
  };
  const wsConnection = new WSController({ onClose });

  wsConnection.addEvent('HELLO', { schema: 
      S.object()
        .prop('username', S.string())
        .prop('password', S.string())
        .required(['username', 'password'])
        .valueOf()
  },
  (socket, data) => {
    socket.send(JSON.stringify(data));
  });

  wsConnection.addEvent('RTC OFFER', { schema:
      S.object()
        .prop('offer', S.object())
        .required(['offer'])
        .valueOf()
  },
  (socket, data) => {
    const { offer } = data;
    const toSocket = pairs.getKey(socket) || pairs.get(socket);
    if (toSocket) {
      toSocket.send(JSON.stringify({ EVENT: 'RTC OFFER', payload: { offer } }));
    }
  });

  wsConnection.addEvent('RTC ANSWER', { schema:
      S.object()
        .prop('answer', S.object())
        .required(['answer'])
        .valueOf()
  },
  (socket, data) => {
    const { answer } = data;
    const toSocket = pairs.get(socket) || pairs.getKey(socket);
    if (toSocket) {
      toSocket.send(JSON.stringify({ EVENT: 'RTC OFFER', payload: { answer } }));
    }
  });

  wsConnection.addEvent('HOST REQUEST', (socket) => {
    if (hosts.getKey(socket)) {
      socket.send(JSON.stringify({ EVENT: 'HOST RESPONSE', payload: { 'success': false } }));
      return;
    }
    const key = generateKey();
    hosts.set(key, socket);
    socket.send(JSON.stringify({ EVENT: 'HOST RESPONSE', payload: { key, 'success': true } }));
  });

  wsConnection.addEvent('JOIN REQUEST', { schema:
      S.object()
        .prop('key', S.string())
        .required(['key'])
        .valueOf()
  }, (socket, data) => {
    const { key } = data;
    const hostSocket = hosts.get(key);
    if (!hostSocket) {
      socket.send(JSON.stringify({ EVENT: 'JOIN RESPONSE',
        payload: { 'success': false, msg: 'Key not found' } }));
      return;
    }
    pairs.set(hostSocket, socket);
    socket.send(JSON.stringify({ EVENT: 'JOIN RESPONSE', payload: { 'success': true } }));
  });


  fastify.get('/signaling', { websocket: true }, (socket) => {
    wsConnection.listen(socket);
  });
};

export default fp(signalingServer);
