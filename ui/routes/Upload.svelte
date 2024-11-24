<script>
  import rtcEvents from '../helpers/rtcEvents.js';
  import Copybox from '../components/Copybox.svelte';

  let files = [];
  let downloadingLink = "";

  const socket = new WebSocket(`ws://${window.location.host}/api/signaling`);
  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('myDataChannel', {
    negotiated: true,
    id: 0,
  });
  const controller = rtcEvents(socket, peerConnection);

  controller.addEvent('HOST RESPONSE', (socket, data) => {
    const { success, key } = data;
    if (!success) {
      console.error('Host request failed');
      return;
    }

    // Generate the link
    downloadingLink = `http://${window.location.host}/#/receive/${key}`;
  });
  controller.listen(socket);

  const handleFileSelect = (event) => {
    files = Array.from(event.target.files);
  };

  const startTransfer = () => {
    socket.send(JSON.stringify({ 'event': 'HOST REQUEST' }));
  };

  peerConnection.addEventListener('connectionstatechange', (event) => {
    if (peerConnection.connectionState === 'connected') {
      console.log('Peers connected!');
    }
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadingLink).then(() => {
    }).catch(err => {
      console.error('Failed to copy the link: ', err);
    });
  };
</script>

<style>
    main {
        max-width: 600px;
        width: 100%;
        padding: 20px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .file-list {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
    }

    .file-item {
        padding: 8px 0;
        border-bottom: 1px solid #ddd;
        white-space: nowrap; /* Prevent text from wrapping to next line */
        overflow: hidden; /* Hide the overflowing text */
        text-overflow: ellipsis; /* Show ellipsis if text overflows */
    }

    .file-details {
        padding: 0 10px;
        font-size: 0.9rem;
        color: #1532b5;
        display: block; /* Make sure the file name and size are treated as separate lines */
        text-overflow: ellipsis; /* Ensure long file names are truncated */
        overflow: hidden;
        max-width: 100%; /* Ensure it doesn't overflow beyond the container */
    }

    .file-item:last-child {
        border-bottom: none;
    }

    button {
        background-color: #28a745;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
    }

    button:hover {
        background-color: #218838;
    }

    input[type="file"] {
        display: none;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }

    .custom-file-button {
        display: inline-block;
        background-color: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        text-align: center;
        transition: background-color 0.3s ease;
    }

    .custom-file-button:hover {
        background-color: #218838;
    }

    .custom-file-button:active {
        background-color: #115921;
    }

    .custom-file-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(25, 104, 32, 0.5);
    }

    p {
        padding: 5px 0;
        margin: 0;
        font-size: 1rem;
    }
</style>

<main>
  <h1>P2P file transfer</h1>


  {#if !downloadingLink}
    <p>Select files to transfer:</p>
    <!-- Custom File Input Button -->
    <label for="file-input" class="custom-file-button">Choose File</label>
    <input type="file" id="file-input" on:change="{handleFileSelect}" />

    <!-- Start Transfer Button -->
    <button on:click="{startTransfer}" disabled="{files.length === 0}">
      Start Transfer
    </button>
  {/if}


  <!-- Display Selected Files -->
  <ul class="file-list">
    {#each files as file}
      <div class="file-item">
        <span class="file-details">
          Chosen file: {file.name}<br />
          Size:
          {#if file.size > 10000}
            {Math.round(file.size / 1024 / 1024)} MB
          {:else}
            {Math.round(file.size / 1024)} KB
          {/if}
        </span>
      </div>
    {/each}
  </ul>

  <!-- Display Generated Link -->
  {#if downloadingLink}
    <Copybox url={downloadingLink} />
  {/if}
</main>
