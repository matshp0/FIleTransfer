import WSController from './wsController.js';

export default function rtcEvents(socket, peerConnection) {
  const controller = new WSController();
  controller.listen(socket);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(JSON.stringify({ "event": 'ICE CANDIDATE', "payload": { candidate: event.candidate } }));
    }
  }

  controller.addEvent('RTC OFFER', async (socket, data) => {
    console.log('RTC OFFER', data);
    const { offer } = data;
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ "event": 'RTC ANSWER', "payload": { answer } }));
  });

  controller.addEvent('RTC ANSWER', async (socket, data) => {
    console.log('RTC ANSWER', data);
    const { answer } = data;
    await peerConnection.setRemoteDescription(answer);
  });

  controller.addEvent('ICE CANDIDATE', async (socket, data) => {
    console.log('ICE CANDIDATE', data);
    const { candidate } = data;
    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  });

  return controller;

}