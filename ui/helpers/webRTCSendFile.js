const CHUNK_SIZE = 262144; // 256KB
const EOF = 'EOF'; // Marker to signify the end of file transfer

export default async function sendFile(file, rtcDataChannel) {
  console.log(rtcDataChannel);
  const reader = new FileReader();
  const { size } = file;
  let offset = 0;

  reader.onload = async (event) => {
    const data = event.target.result;
    console.log(`Sending ${data.byteLength} bytes, sent: ${offset / CHUNK_SIZE}`);

    await waitForBufferedAmount(rtcDataChannel);

    rtcDataChannel.send(data);
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
      rtcDataChannel.send(EOF);
      console.log('File transfer complete. EOF sent.');
      return;
    }
  };

  const waitForBufferedAmount = (rtcDataChannel) => {
    return new Promise((resolve) => {
      const threshold = 15 * 1024 * 1024;
      if (rtcDataChannel.bufferedAmount < threshold) {
        resolve();
      } else {
        setTimeout(() => waitForBufferedAmount(rtcDataChannel).then(resolve), 10);
      }
    });
  };

  // Start reading the first chunk
  readNextChunk();
}
