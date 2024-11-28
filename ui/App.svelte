<script>
  import Router, { replace } from 'svelte-spa-router'
  import Upload from './routes/Upload.svelte'
  import Download from './routes/Download.svelte';
  import NotFound from './routes/404.svelte'
  import Loader from './components/Loader.svelte'
  import Redirect from './routes/Redirect.svelte'
  import Test from './components/Test.svelte'


  const routes = {
    '/': Upload,
    '/test': Test,
    '/receive/:id': Download,
    '/receive': Redirect,
    '*': NotFound
  }
  let loading = false
</script>

<svelte:head>
  <title>File transfer</title>
</svelte:head>

{#if loading}
  <Loader />
{:else}
  <Router
    {routes}
  />
{/if}

