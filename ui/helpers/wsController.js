export default class WSController {
  constructor(opt) {
    this.events = new Map();
    this.opt = opt;
    this.set = new Set();
  }

  listen(socket) {
    this.set.add(socket);
    const { onClose, onError } = this.opt;
    !onClose || socket.on('close', onClose);
    !onError || socket.on('error', onError);
    const onMessage = this.onMessage.bind(this, socket);
    socket.on('message', onMessage);
  }

  addEvent(event, handler) {
    this.events.set(event, { handler});
  }

  onMessage(socket, data) {
    try {
      const message = JSON.parse(data);
      const { EVENT, payload } = message;
      const { handler } = this.events.get(EVENT) ?? {};
      console.log('EVENT:', EVENT);
      if (!handler) {
        throw new Error('Event not found');
      }
      handler(socket, payload);
    } catch (err) {
      console.log(err);
      console.error('ERROR:', err.message);
    }
  }
}
