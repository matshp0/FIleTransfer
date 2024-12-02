export default class RtcClient {
  constructor(socket, socketId) {
    this.socket = socket;
    this.destination = socketId;
    this.peerConnection = new RTCPeerConnection();
    this.CHUNK_SIZE = 16 * 1024;
    this.dataChannel = this.peerConnection.createDataChannel('FileTransfer', {
      negotiated: true,
      id: 0,
    });
    this.peerConnection.onicecandidate = this.onCandidateDiscovery.bind(this);
    this.peerConnection.addEventListener('connectionstatechange', event => {
      if (this.peerConnection.connectionState === 'connected') {
        console.log('PEERS CONNECTION ESTABLISHED');
      }
    });
  }

  async onCandidateDiscovery(event) {
    if (event.candidate) {
      this.socket.send(JSON.stringify({ event: 'ICE_CANDIDATE',
        payload: { candidate: event.candidate, destination: this.destination} }));
    }
  }

  async onOffer(socket, data) {
    console.log('RTC OFFER', data);
    const { offer } = data;
    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      socket.send(JSON.stringify({ event: 'RTC_ANSWER',
        payload: { answer, destination: this.destination} }));
    }
    catch (e) {
      console.error('Error creating answer', e);
    }
  }

  async onCandidate (socket, data) {
    console.log('ICE CANDIDATE', data);
    const { candidate } = data;
    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket.send(JSON.stringify({ event: 'RTC_OFFER',
      payload: { offer, destination: this.destination } }));

  }

  async onAnswer(socket, data) {
    console.log('RTC_ANSWER', data);
    this.socket = socket;
    const { answer } = data;
    try {
      const { answer } = data;
      await this.peerConnection.setRemoteDescription(answer);
    } catch (e) {
      console.error('Error receiving answer', e);
    }
  }

  async sendFile(file) {
    const reader = new FileReader();
    const { size } = file;
    let offset = 0;

    reader.onload = async (event) => {
      const data = event.target.result;
      console.log(`Sending ${data.byteLength} bytes, sent: ${offset / CHUNK_SIZE}`);
      await waitForBufferedAmount(this.dataChannel);
      this.dataChannel.send(data);
      offset += data.byteLength;
      readNextChunk();
    };

    reader.onerror = (event) => {
      console.error('FileReader error', event.target.error);
      throw event.target.error;
    };

    const readNextChunk = () => {
      if (offset < size) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
      } else {
        this.dataChannel.send(EOF);
        console.log('File transfer complete. EOF sent.');
        return;
      }
    };

    const waitForBufferedAmount = () => {
      return new Promise((resolve) => {
        const threshold = 15 * 1024 * 1024;
        if (this.dataChannel.bufferedAmount < threshold) {
          resolve();
        } else {
          setTimeout(() => waitForBufferedAmount().then(resolve), 10);
        }
      });
    };
    readNextChunk();
  }
}
