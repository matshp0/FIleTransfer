import WSController from './wsController.js';
import RtcClient from './RtcClient.js';

export default class Uploader {
  constructor(socket) {
    this.socket = socket;
    this.wsController = new WSController();
    this.rtcClient = new Map();
    this.files = [];
    this.socketId = null;
    socket.onopen = this.onOpen.bind(this);
  }

  onOpen () {
    this.setEvents();
    this.getSocketId();
  }

  getSocketId () {
    this.socket.send(JSON.stringify({ event: 'GET_SOCKET_ID' }));
  }

  setEvents () {
    this.wsController.addEvent('JOIN_REQUEST', async (socket, data) => {
      const { origin } = data;
      const client = new RtcClient(this.socket, origin);
      this.rtcClient.set(origin, client);
      const metadata = this.files.map(({ name, size }) => ({ name, size }));
      socket.send(JSON.stringify({ event: 'FILE_METADATA',
        payload: { destination: origin, files: metadata } }));
    });

    this.wsController.addEvent('RTC_OFFER',  async (socket, data) => {
      const { origin } = data;
      const client = this.rtcClient.get(origin);
      if (!client) {
        console.log(`Client ${origin} not found`);
        return;
      }
      await client.onOffer(socket, data);
    });

    this.wsController.addEvent('ICE_CANDIDATE',  async (socket, data) => {
      const { origin } = data;
      const client = this.rtcClient.get(origin);
      if (!client) {
        console.log(`Client ${origin} not found`);
        return;
      }
      await client.onCandidate(socket, data);
    });

    this.wsController.addEvent('SOCKET_ID', (socket, data) => {
      const { id } = data;
      this.socketId = id;
    });

    this.wsController.listen(this.socket);
    }
}