<script>
  import { onMount } from 'svelte';
  import { ref, onValue } from 'firebase/database';
  import { database } from './lib/firebase';

  const deviceName = 'RoomMonitor1';

  /** @type {number | null} */
  let temperature = null;

  /** @type {number | null} */
  let humidity = null;

  /** @type {number | null} */
  let uptime = null;

  /** @type {'connecting' | 'connected' | 'disconnected'} */
  let firebaseStatus = 'connecting';

  let firebaseError = '';

  /** @type {'unknown' | 'online' | 'offline'} */
  let deviceStatus = 'unknown';

  /** @type {'unknown' | 'connected' | 'disconnected'} */
  let wifiStatus = 'unknown';

  let theme = 'light';
  

  onMount(() => {

    const savedTheme =
      localStorage.getItem('room-monitor-theme');

    if (
      savedTheme === 'light' ||
      savedTheme === 'dark'
    ) {
      theme = savedTheme;
    } else {
      theme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
        ? 'dark'
        : 'light';
    }

    document.documentElement.dataset.theme =
      theme;

    const roomMonitorRef = ref(
      database,
      deviceName
    );

    const unsubscribe = onValue(
      roomMonitorRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          temperature = data.Suhu ?? null;
          humidity = data.KelembapanUdara ?? null;
          uptime = data.Uptime ?? null;

          firebaseStatus = 'connected';
          firebaseError = '';

          console.log(
            'Firebase data:',
            data
          );
        } else {
          firebaseStatus = 'connected';
          firebaseError =
            'Data RoomMonitor1 belum tersedia.';
        }
      },
      (error) => {
        console.error(
          'Firebase error:',
          error
        );

        firebaseStatus = 'disconnected';
        firebaseError = error.message;
      }
    );

    return () => unsubscribe();
  });

  $: formattedUptime =
    uptime !== null
      ? formatUptime(uptime)
      : '--';

  /**
   * @param {number} milliseconds
   * @returns {string}
   */
  function formatUptime(milliseconds) {
    const totalSeconds =
      Math.floor(milliseconds / 1000);

    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  }

  /**
   * @param {'connecting' | 'connected' | 'disconnected' | 'unknown' | 'online' | 'offline'} status
   * @returns {string}
   */
  function statusLabel(status) {
    const labels = {
      connecting: 'Connecting',
      connected: 'Connected',
      disconnected: 'Disconnected',
      unknown: 'Unknown',
      online: 'Online',
      offline: 'Offline'
    };

    return labels[status] ?? 'Unknown';
  }

  function toggleTheme() {
    theme =
      theme === 'light'
        ? 'dark'
        : 'light';

    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      'room-monitor-theme',
      theme
    );
  }
</script>

<svelte:head>
  <title>Room Monitor</title>

  <meta
    name="description"
    content="Room environmental monitoring dashboard"
  />
</svelte:head>

<div class="app">

  <header class="header">
    <div class="header-inner">

      <div>
        <p class="eyebrow">
          ROOM MONITOR
        </p>

        <h1>
          {deviceName}
        </h1>

        <p class="subtitle">
          Environmental monitoring
        </p>
      </div>
        <div class="header-actions">

          <button
            class="theme-toggle"
            type="button"
            aria-label="Toggle color theme"
            onclick={toggleTheme}
          >
            {#if theme === 'light'}
              ☾
            {:else}
              ☀
            {/if}
          </button>

          <div class="header-status">
            <span
              class:state-good={firebaseStatus === 'connected'}
              class:state-bad={firebaseStatus === 'disconnected'}
              class:state-pending={firebaseStatus === 'connecting'}
              class="state-indicator"
            ></span>

            <span>
              {statusLabel(firebaseStatus)}
            </span>
          </div>

        </div>
    </div>
  </header>


  <main class="container">

    {#if firebaseError}
      <section class="error-message">
        <span class="error-title">
          Firebase
        </span>

        <span>
          {firebaseError}
        </span>
      </section>
    {/if}


    <!-- CONNECTION STATUS -->

    <section class="section">

      <div class="section-heading">
        <span>CONNECTION</span>
      </div>

      <div class="status-grid">

        <article class="status-item">
          <div class="status-item-header">
            <span class="status-name">
              Firebase
            </span>

            <span
              class:state-good={firebaseStatus === 'connected'}
              class:state-bad={firebaseStatus === 'disconnected'}
              class:state-pending={firebaseStatus === 'connecting'}
              class="state-indicator"
            ></span>
          </div>

          <strong>
            {statusLabel(firebaseStatus)}
          </strong>

          <p>
            Dashboard connection
          </p>
        </article>


        <article class="status-item">
          <div class="status-item-header">
            <span class="status-name">
              Device
            </span>

            <span class="state-indicator state-unknown"></span>
          </div>

          <strong class="muted-value">
            {statusLabel(deviceStatus)}
          </strong>

          <p>
            ESP32 availability
          </p>
        </article>


        <article class="status-item">
          <div class="status-item-header">
            <span class="status-name">
              Wi-Fi
            </span>

            <span class="state-indicator state-unknown"></span>
          </div>

          <strong class="muted-value">
            {statusLabel(wifiStatus)}
          </strong>

          <p>
            Device network status
          </p>
        </article>

      </div>

    </section>


    <!-- SENSOR -->

    <section class="section">

      <div class="sensor-grid">

        <article class="sensor-card">

          <p class="sensor-label">
            TEMPERATURE
          </p>

          <div class="sensor-value">
            {temperature !== null
              ? temperature.toFixed(1)
              : '--'}

            <span>°C</span>
          </div>

          <p class="sensor-description">
            Room temperature
          </p>

        </article>


        <article class="sensor-card">

          <p class="sensor-label">
            HUMIDITY
          </p>

          <div class="sensor-value">
            {humidity !== null
              ? humidity.toFixed(1)
              : '--'}

            <span>%</span>
          </div>

          <p class="sensor-description">
            Relative humidity
          </p>

        </article>

      </div>

    </section>


    <!-- DEVICE INFORMATION -->

    <section class="section device-section">

      <div class="section-heading">
        <span>DEVICE</span>
      </div>

      <div class="device-details">

        <div class="detail-row">
          <span>Connection</span>

          <strong>
            {statusLabel(deviceStatus)}
          </strong>
        </div>


        <div class="detail-row">
          <span>Wi-Fi</span>

          <strong>
            {statusLabel(wifiStatus)}
          </strong>
        </div>


        <div class="detail-row">
          <span>Uptime</span>

          <strong>
            {formattedUptime}
          </strong>
        </div>


        <div class="detail-row">
          <span>Last update</span>

          <strong>
            Realtime
          </strong>
        </div>

      </div>

    </section>

  </main>

</div>

<style>
  /* =========================================================
     APP
     ========================================================= */

  .app {
    min-height: 100vh;

    background: var(--bg);
    color: var(--text);

    transition:
      background-color 160ms ease,
      color 160ms ease;
  }


  /* =========================================================
     HEADER
     ========================================================= */

  .header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);

    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .header-inner {
    width: min(1100px, calc(100% - 48px));

    min-height: 104px;

    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 32px;
  }

  .eyebrow {
    margin: 0 0 5px;

    font-size: 11px;
    font-weight: 700;
    line-height: 1;

    letter-spacing: 0.12em;

    color: var(--text-muted);
  }

  h1 {
    margin: 0;

    font-size: 24px;
    line-height: 1.2;
    font-weight: 650;

    letter-spacing: -0.025em;

    color: var(--text);
  }

  .subtitle {
    margin: 5px 0 0;

    font-size: 13px;
    line-height: 1.4;

    color: var(--text-muted);
  }


  /* =========================================================
     HEADER ACTIONS
     ========================================================= */

  .header-actions {
    display: flex;
    align-items: center;

    gap: 18px;
  }

  .header-status {
    display: flex;
    align-items: center;

    gap: 8px;

    font-size: 12px;
    font-weight: 600;

    color: var(--text-secondary);

    white-space: nowrap;
  }

  .theme-toggle {
    width: 34px;
    height: 34px;

    display: grid;
    place-items: center;

    padding: 0;

    border: 1px solid var(--border);
    border-radius: 7px;

    background: var(--surface);

    color: var(--text-secondary);

    font-size: 16px;
    line-height: 1;

    cursor: pointer;

    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      color 120ms ease,
      transform 120ms ease;
  }

  .theme-toggle:hover {
    background: var(--surface-muted);

    color: var(--text);
  }

  .theme-toggle:active {
    transform: scale(0.95);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--text-secondary);
    outline-offset: 2px;
  }


  /* =========================================================
     MAIN CONTAINER
     ========================================================= */

  .container {
    width: min(1100px, calc(100% - 48px));

    margin: 0 auto;

    padding: 36px 0 64px;
  }


  /* =========================================================
     SECTIONS
     ========================================================= */

  .section {
    margin-bottom: 36px;
  }

  .section-heading {
    margin-bottom: 12px;

    font-size: 11px;
    font-weight: 700;
    line-height: 1;

    letter-spacing: 0.12em;

    color: var(--text-muted);
  }


  /* =========================================================
     CONNECTION STATUS
     ========================================================= */

  .status-grid {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);

    background: var(--surface);

    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .status-item {
    min-height: 112px;

    padding: 18px 20px;

    background: var(--surface);

    transition:
      background-color 160ms ease;
  }

  .status-item + .status-item {
    border-left: 1px solid var(--border);
  }

  .status-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;
  }

  .status-name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;

    color: var(--text-secondary);
  }

  .status-item strong {
    display: block;

    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;

    color: var(--text);
  }

  .status-item p {
    margin: 4px 0 0;

    font-size: 12px;
    line-height: 1.4;

    color: var(--text-muted);
  }

  .muted-value {
    color: var(--text-muted) !important;
  }


  /* =========================================================
     STATUS INDICATORS
     ========================================================= */

  .state-indicator {
    width: 7px;
    height: 7px;

    flex: 0 0 auto;

    border-radius: 50%;

    background: var(--unknown);
  }

  .state-good {
    background: var(--success);
  }

  .state-bad {
    background: var(--danger);
  }

  .state-pending {
    background: var(--warning);
  }

  .state-unknown {
    background: var(--unknown);
  }


  /* =========================================================
     SENSOR SECTION
     ========================================================= */

  .sensor-grid {
    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 1px;

    overflow: hidden;

    background: var(--border);
    border: 1px solid var(--border);

    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .sensor-card {
    min-height: 230px;

    padding: 28px;

    background: var(--surface);

    transition:
      background-color 160ms ease;
  }

  .sensor-label {
    margin: 0;

    font-size: 11px;
    font-weight: 700;
    line-height: 1;

    letter-spacing: 0.12em;

    color: var(--text-muted);
  }

  .sensor-value {
    margin-top: 44px;

    font-size:
      clamp(42px, 6vw, 64px);

    line-height: 1;

    font-weight: 650;

    letter-spacing: -0.055em;

    color: var(--text);

    font-variant-numeric: tabular-nums;
  }

  .sensor-value span {
    margin-left: 5px;

    font-size: 22px;
    font-weight: 500;
    line-height: 1;

    letter-spacing: -0.01em;

    color: var(--text-muted);
  }

  .sensor-description {
    margin: 14px 0 0;

    font-size: 13px;
    line-height: 1.4;

    color: var(--text-muted);
  }


  /* =========================================================
     DEVICE DETAILS
     ========================================================= */

  .device-section {
    margin-bottom: 0;
  }

  .device-details {
    background: var(--surface);

    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);

    transition:
      background-color 160ms ease,
      border-color 160ms ease;
  }

  .detail-row {
    min-height: 52px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 24px;

    padding: 0 4px;

    font-size: 13px;
    line-height: 1.4;
  }

  .detail-row + .detail-row {
    border-top: 1px solid var(--border-subtle);
  }

  .detail-row span {
    color: var(--text-muted);
  }

  .detail-row strong {
    font-weight: 600;

    color: var(--text-secondary);

    text-align: right;

    font-variant-numeric: tabular-nums;
  }


  /* =========================================================
     ERROR MESSAGE
     ========================================================= */

  .error-message {
    display: flex;
    align-items: center;

    gap: 12px;

    margin-bottom: 28px;
    padding: 12px 14px;

    border-left: 3px solid var(--danger);

    background: var(--error-bg);

    font-size: 13px;
    line-height: 1.4;

    color: var(--error-text);

    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }

  .error-title {
    font-weight: 700;

    flex: 0 0 auto;
  }


  /* =========================================================
     TABLET / MOBILE
     ========================================================= */

  @media (max-width: 700px) {

    .header-inner {
      width: min(
        calc(100% - 32px),
        1100px
      );

      min-height: auto;

      padding: 24px 0;

      align-items: flex-start;

      flex-direction: column;

      gap: 16px;
    }

    .header-actions {
      width: 100%;

      justify-content: space-between;
    }

    .container {
      width: min(
        calc(100% - 32px),
        1100px
      );

      padding-top: 28px;
      padding-bottom: 48px;
    }

    .section {
      margin-bottom: 30px;
    }

    .status-grid {
      grid-template-columns: 1fr;
    }

    .status-item {
      min-height: auto;

      padding: 16px;
    }

    .status-item + .status-item {
      border-left: 0;

      border-top: 1px solid var(--border);
    }

    .sensor-grid {
      grid-template-columns: 1fr;
    }

    .sensor-card {
      min-height: 200px;

      padding: 24px;
    }

    .sensor-value {
      margin-top: 36px;

      font-size: 48px;
    }

    .detail-row {
      min-height: 50px;

      padding: 0;

      gap: 16px;
    }
  }


  /* =========================================================
     SMALL MOBILE
     ========================================================= */

  @media (max-width: 420px) {

    .header-inner {
      width: calc(100% - 28px);
    }

    .container {
      width: calc(100% - 28px);
    }

    h1 {
      font-size: 22px;
    }

    .sensor-card {
      min-height: 180px;

      padding: 22px;
    }

    .sensor-value {
      font-size: 44px;
    }

    .sensor-value span {
      font-size: 19px;
    }

    .detail-row {
      font-size: 12px;
    }
  }

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  @media (prefers-reduced-motion: reduce) {

    .app,
    .header,
    .theme-toggle,
    .sensor-card,
    .status-item,
    .device-details,
    .error-message {
      transition: none;
    }
  }
</style>