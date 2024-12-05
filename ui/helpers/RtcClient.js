import streamSaver from 'streamsaver';

const CHUNK_SIZE = 262144; //256KB
const EOF = 'EOF'; // End of file
const THRESHOLD = 12 * 1024 * 1024; // 12MB

export default class RtcClient extends EventTarget {
  constructor(socket, socketId) {
    super();
    this.socket = socket;
    this.destination = socketId;
    this.peerConnection = new RTCPeerConnection();
    this.dataChannel = this.peerConnection.createDataChannel('FileTransfer', {
      negotiated: true,
      id: 0,
    });
    this.peerConnection.onicecandidate = this.onCandidateDiscovery.bind(this);
    this.dataChannel.addEventListener('open', event => {
      const openChannelEvent = new Event('dataChannelOpen');
      this.dispatchEvent(openChannelEvent);
    }, {once: true});
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

  awaitReadyState() {
    return new Promise((resolve) => {
      this.dataChannel.addEventListener('message', event => {
        const message = event.data;
        if (message === 'READY') {
          resolve();
        }
      }, { once: true });
    });
  }
  async sendFiles(files) {
    for (const file of files) {
      console.log('awaiting ready state');
      await this.awaitReadyState();
      console.log('sending files');
      await this.sendFile(file);
    }
  }

  async sendFile(file) {
    return new Promise((resolve) => {
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
          resolve();
        }
      };

      const waitForBufferedAmount = () => {
        return new Promise((resolve) => {
          if (this.dataChannel.bufferedAmount < THRESHOLD) {
            resolve();
          } else {
            setTimeout(() => waitForBufferedAmount().then(resolve), 10);
          }
        });
      };
      readNextChunk();
    });
  }

  async receiveFiles(files) {
    console.log(JSON.stringify(files));
    for (const file of files){
      this.dataChannel.send('READY');
      await this.receiveFile(file);
    }
  }

  async receiveFile(file) {
    return new Promise((resolve) => {
      const { name, size } = file;
      const fileStream = streamSaver.createWriteStream(name, { size });
      const writer = fileStream.getWriter();
      window.onunload = () => {
        fileStream.abort()
        writer.abort()
      }
      this.dataChannel.onmessage = (event) => {
        const message = event.data;
        console.log('Received chunk', message.length);
        if (message === 'EOF') {
          writer.close();
          resolve();
          return;
        }
        const uint8chunk = new Uint8Array(message);
        writer.write(uint8chunk);
      }
    });
  }
}
