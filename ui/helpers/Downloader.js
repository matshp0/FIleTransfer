import WSController from './wsController.js';
import RtcClient from './RtcClient.js';

export default class Downloader {
  constructor(socket, socketId) {
    console.log(socket, socketId);
    this.socket = socket;
    this.destination = socketId;
    this.wsController = new WSController();
    this.rtcClient = new RtcClient(socket, socketId);
    this.socket.onopen = this.onOpen.bind(this);
    this.rtcClient.addEventListener('dataChannelOpen',  () => {
    });
  }

  async startDownload() {
    console.log(this.files);
    await this.rtcClient.receiveFiles(this.files);
  }

  async onOpen() {
    this.setListeners();
    this.socket.send(JSON.stringify({ event: 'JOIN_REQUEST',
      payload: { destination: this.destination } }));
  }

  setListeners() {
    this.wsController.addEvent('RTC_ANSWER', this.rtcClient.onAnswer.bind(this.rtcClient));
    this.wsController.addEvent('ICE_CANDIDATE', this.rtcClient.onCandidate.bind(this.rtcClient));
    this.wsController.addEvent('FILE_METADATA', async (socket, data) => {
      console.log('FILE METADATA');
      const { files } = data;
      this.files = files;
      await this.rtcClient.createOffer();
    });
    this.wsController.listen(this.socket);
  }
}