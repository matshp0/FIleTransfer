<script>
  let { url } = $props();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      console.log("Copied to clipboard:", url);
    }).catch((err) => {
      console.error("Failed to copy the URL:", err);
    });
  };
</script>

<style>
    .container {
        display: flex;
        align-items: center;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
        font-family: monospace;
        font-size: 14px;
        color: #333;
        width: fit-content;
    }

    .url {
        margin-right: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .copy-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        padding: 5px;
        display: flex;
        align-items: center;
    }

    .copy-button:hover {
        color: #333;
    }

    .icon {
        width: 16px;
        height: 16px;
        display: inline-block;
    }
</style>

<div class="container">
  <span class="url">{url}</span>
  <button
    class="copy-button"
    aria-label="Copy URL to clipboard"
    on:click={copyToClipboard}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8 16h8m-8-4h8m-8-4h8m-7 12h7a2 2 0 002-2V6a2 2 0 00-2-2h-7a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  </button>
</div>
