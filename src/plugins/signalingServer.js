import fp from 'fastify-plugin';
import BiMap from 'bidirectional-map';

const signalingServer = async (fastify) => {
  const pairs = new BiMap();
  const connections = fastify.websocketServer.clients;

  const findSocketById = (id) => {
    if (!id) return null;
    for (const socket of connections) {
      if (socket.id === id) {
        return socket;
      }
    }
  };

  const messageHandler = (socket, data) => {
    try {
      const message = JSON.parse(data);
      const { offer, answer, candidate } = message;
      if (offer) {
        const receivingSocket = findSocketById(message?.receiverId);
        if (!receivingSocket) {
          socket.send('Error: Id not found');
          return;
        }
        if (!pairs.get(receivingSocket)) {
          pairs.set(receivingSocket, socket);
        }
        receivingSocket.send(JSON.stringify({ offer, id: socket.id }));
        console.log('Received offer');
      }

      if (answer) {
        const client = pairs.get(socket);
        if (!client) {
          socket.send('Error: No offer received');
          return;
        }
        client.send(JSON.stringify({ answer, id: socket.id }));
        console.log('Received answer');
      }

      if (candidate) {
        const client = pairs.get(socket) || pairs.getKey(socket);
        if (!client) {
          socket.send('Error: No offer received');
          return;
        }
        client.send(JSON.stringify({ candidate }));
        console.log(candidate);
        console.log('Candidate received');
      }
    } catch (err) {
      socket.send(`Error: ${err.message}`);
      console.log(err);
    }
  };

  const closeHandler = (socket) => {
    pairs.delete(socket);
  };

  fastify.get('/signaling/:id', { websocket: true }, (socket, req) => {
    console.log('Client connected');
    socket.id = req.params.id;
    socket.on('message', (message) => {
      console.log(`Received message: ${message}`);
      messageHandler(socket, message);
    });

    socket.on('close', () => {
      console.log('Client disconnected');
      closeHandler(socket);
    });
  });
};

export default fp(signalingServer);
