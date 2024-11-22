import wsController from './helpers/wsController.js';

export default async function initConnection(socket, peerConnection) {
  const controller = new wsController(socket);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(JSON.stringify({"event": 'ICE CANDIDATE', "payload": { candidate: event.candidate }}));
  }

  controller.addEvent('RTC OFFER', async (data) => {
    const { offer } = data;
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({"event": 'RTC ANSWER', "payload": { answer }}));
  });

  controller.addEvent('RTC ANSWER', async (data) => {
    const { answer } = data;
    await peerConnection.setRemoteDescription(answer);
  });

  controller.addEvent('ICE CANDIDATE', async (data) => {
    const { candidate } = data;
    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  });
}