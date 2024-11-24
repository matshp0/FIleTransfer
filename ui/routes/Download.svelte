<script>
  export let params = {}

  import rtcEvents from '../helpers/rtcEvents.js';
  const hostId = params.id;
  const socket = new WebSocket(`ws://${window.location.host}/api/signaling`);
  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('myDataChannel', {
    negotiated: true,
    id: 0,
  });
  const controller = rtcEvents(socket, peerConnection);

  controller.addEvent('JOIN RESPONSE', (socket, data) => {
    const { success, msg } = data;
    if (!success) {
      console.error(msg);
      return;
    }
    console.log('Download request accepted');
  });
  controller.listen(socket);

  const requestDownload = () => {
    socket.send(JSON.stringify({ 'event': 'JOIN REQUEST', payload: { key: hostId } }));
  }

  const initiateRtcConnection = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ 'event': 'RTC OFFER', payload: { offer } }));
  }

  peerConnection.addEventListener('connectionstatechange', event => {
    if (peerConnection.connectionState === 'connected') {
      console.log('Peers connected!');
    }
  });
</script>

<style>
    main {
        max-width: 400px;
        width: 100%;
        padding: 20px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
        margin: 0 auto;
    }

    button {
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
        font-size: 1rem;
    }

    button:hover {
        background-color: #218838;
    }

    button:disabled {
        background-color: #c3e6cb;
        cursor: not-allowed;
    }
</style>

<main>

  <h1>Download File</h1>
  <p>Click below to initiate a file download:</p>

  <!-- Simulate File -->
  <button on:click={requestDownload}>Send download request</button>

  <!-- Download Button -->
  <button on:click={initiateRtcConnection}>
    Initiate webRTC connection
  </button>

  <!-- Feedback Message -->
  {#if true}
    <p><strong>Ready to download:</strong></p>
  {/if}
</main>
