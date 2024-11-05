import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';

import '../components/sw-credits.js';

import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function main($container) {
  const config = loadConfig();
  const client = new Client(config);

  launcher.register(client, { initScreensContainer: $container });

  await client.start();

  const global = await client.stateManager.attach('global', ['webviewPage']);
  global.onUpdate(updates => renderApp(), true);

  function renderApp() {
    render(html`
      <div class="simple-layout">
        <h1>CoMote Test WebView</h1>

        ${global.get('webviewPage') === '1'
          ? html`
              <div style="margin: 4px 0;">
                <h2>Page 1</h2>
                <sc-text>w/ attributes</sc-text>
                <sc-button
                  comote-key="my-button"
                  comote-touchstart="1"
                  comote-touchend="0"
                >Simple Test</sc-button>
              </div>
              <div style="margin: 4px 0;">
                <sc-text>w/ sendEvent</sc-text>
                <sc-slider
                  @input=${e => sendEvent('my-slider', e.detail.value)}
                ></sc-slider>
                <sc-toggle
                  @change=${e => sendEvent('my-toggle', e.detail.value)}
                ></sc-toggle>
              </div>
            `
          : html`
              <div style="margin: 4px 0;">
                <h2>Page 2</h2>
                <sc-text>my-second-slider</sc-text>
                <sc-slider
                  @input=${e => sendEvent('my-second-slider', e.detail.value)}
                ></sc-slider>
              </div>
            `
        }


        <sw-credits .infos="${client.config.app}"></sw-credits>
      </div>
    `, $container);
  }
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
