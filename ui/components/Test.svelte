<script>
  import streamSaver from 'streamsaver';

  let fileName = 'streamed-file.txt';
  let isSaving = false;
  let statusMessage = 'Click "Start Saving" to begin streaming data.';
  let abortController;

  const saveStreamedFile = async () => {
    isSaving = true;
    statusMessage = 'Streaming data...';
    abortController = new AbortController();

    try {
      // Create a writable stream
      const fileStream = streamSaver.createWriteStream(fileName);

      // Simulate streaming data in chunks
      const writer = fileStream.getWriter();

      for (let i = 1; i <= 10; i++) {
        // Abort the process if the user cancels
        if (abortController.signal.aborted) {
          throw new Error('Saving aborted by user.');
        }

        const chunk = `Chunk ${i}: This is some streamed data...\n`;
        const encodedChunk = new TextEncoder().encode(chunk);
        await writer.write(encodedChunk);

        // Simulate a delay to mimic real-time streaming
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      writer.close();
      statusMessage = 'File saved successfully!';
    } catch (error) {
      statusMessage = error.message || 'An error occurred while saving the file.';
    } finally {
      isSaving = false;
    }
  };

  const cancelSaving = () => {
    if (abortController) {
      abortController.abort();
      isSaving = false;
      statusMessage = 'Saving process canceled.';
    }
  };
</script>

<style>
    .container {
        margin: 1rem auto;
        padding: 1rem;
        width: 80%;
        max-width: 500px;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    button {
        padding: 0.5rem 1rem;
        margin: 0.5rem;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
    button.cancel {
        background-color: #dc3545;
    }
    button.cancel:hover {
        background-color: #a71d2a;
    }
    .status {
        margin-top: 1rem;
        font-weight: bold;
    }
</style>

<div class="container">
  <h2>Stream Save to File</h2>
  <label for="fileName">File Name:</label>
  <input id="fileName" type="text" bind:value={fileName} placeholder="Enter file name" />

  <button on:click={saveStreamedFile} disabled={isSaving}>Start Saving</button>
  <button on:click={cancelSaving} disabled={!isSaving} class="cancel">Cancel</button>

  <div class="status">{statusMessage}</div>
</div>
