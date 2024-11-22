<script>
  import Button from './button.svelte';
  let files = [];

  const handleFileSelect = (event) => {
    files = Array.from(event.target.files);
  };

  const startTransfer = () => {
    console.log('Starting file transfer for:', files);
    alert('File transfer started!');
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
        color: #555;
        display: block; /* Make sure the file name and size are treated as separate lines */
        text-overflow: ellipsis; /* Ensure long file names are truncated */
        overflow: hidden;
        max-width: 100%; /* Ensure it doesn't overflow beyond the container */
    }

    .file-item:last-child {
        border-bottom: none;
    }

    button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 20px;
    }

    button:hover {
        background-color: #0056b3;
    }

    input[type="file"] {
        display: none;
    }

    .custom-file-button {
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        text-align: center;
        transition: background-color 0.3s ease;
    }

    .custom-file-button:hover {
        background-color: #0056b3;
    }

    .custom-file-button:active {
        background-color: #003f7f;
    }

    .custom-file-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
    }

    p {
        padding: 5px 0;
        margin: 0;
        font-size: 1rem;
    }
</style>

<main>
  <h1>Web RTC file transfer</h1>
  <p>Select files to transfer:</p>

  <!-- Custom File Input Button -->
  <label for="file-input" class="custom-file-button">Choose File</label>
  <input type="file" id="file-input" on:change="{handleFileSelect}" />

  <!-- Display Selected Files -->
  <ul class="file-list">
    {#each files as file}
      <li class="file-item">
        <span class="file-details">
          <strong>Chosen file: {file.name}</strong> ({Math.round(file.size / 1024)} KB)
        </span>
      </li>
    {/each}
  </ul>
  <Button label="Submit" />

  <!-- Transfer Button -->
  {#if files.length > 0}
    <button on:click="{startTransfer}">Start Transfer</button>
  {/if}
</main>
