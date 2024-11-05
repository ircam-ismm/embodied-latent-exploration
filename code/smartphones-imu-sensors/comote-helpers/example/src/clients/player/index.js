import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';

import '../components/sw-credits.js';
import * as CoMoteQRCode from '../../../../src/qrcode.js';

import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-editor.js';
import '@ircam/sc-components/sc-tab.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function main($container) {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig();
  const client = new Client(config);
  launcher.register(client, { initScreensContainer: $container });

  await client.start();

  const global = await client.stateManager.attach('global');

  let qrCode;
  let devicemotion = {};
  let buttonA = false;
  let buttonB = false;
  let control = {};

  global.onUpdate(async updates => {
    if ('comoteConfig' in updates) {
      qrCode = await CoMoteQRCode.dataURL(updates.comoteConfig);
    }

    if ('data' in updates) {
      if ('devicemotion' in updates.data) {
        devicemotion = updates.data.devicemotion;
      }

      if ('control' in updates.data) {
        control = updates.data.control;

        if ('buttonA' in updates.data.control) {
          buttonA = !!updates.data.control.buttonA;
        } else if ('buttonB' in updates.data.control) {
          buttonB = !!updates.data.control.buttonB;
        }
      }
    }

    renderApp();
  }, true);

  function renderApp() {
    render(html`
      <div style="padding: 20px">
        <h1 style="margin: 20px 0">CoMote dashboard</h1>

        <div style="margin-bottom: 10px;">
          <sc-text>WiFi infos</sc-text>
          <sc-text style="height: 80px;">${JSON.stringify(global.get('wifiInfos'), null, 2)}</sc-text>
        </div>
        <div style="margin-bottom: 10px;">
          <sc-text>Settings</sc-text>
          <sc-editor
            value=${JSON.stringify(global.get('comoteConfig'), null, 2)}
            @change=${e => global.set({ comoteConfig: JSON.parse(e.detail.value) })}
          ></sc-editor>
        </div>

        <div style="display: inline-block; vertical-align: top; margin-right: 12px">
          <sc-text style="display: block; margin-bottom: 4px;">Flash QR to retrieve settings in CoMote</sc-text>
          <img src=${qrCode} width="300" height="300" style="image-rendering: pixelated;"/>
        </div>

        <div style="display: inline-block; vertical-align: top; margin-right: 12px">
          <sc-text style="width: 300px; height: 350px">${JSON.stringify(devicemotion, null, 2)}</sc-text>
        </div>

        <div style="display: inline-block; vertical-align: top; margin-right: 12px">
          <div style="margin-bottom: 6px">
            <sc-text>buttonA</sc-text>
            <sc-toggle .active=${buttonA}></sc-toggle>
          </div>
          <div style="margin-bottom: 6px">
            <sc-text>buttonB</sc-text>
            <sc-toggle .active=${buttonB}></sc-toggle>
          </div>
          <div style="margin-bottom: 6px">
            <sc-text>Arbitrary control (webview)</sc-text>
            <sc-text>${JSON.stringify(control)}</sc-text>
          </div>
        </div>

        <div style="margin-top: 12px">
          <sc-text>webview page</sc-text>
          <sc-tab
            .options=${['1', '2']}
            value=${global.get('webviewPage')}
            @change=${e => global.set({ webviewPage: e.detail.value })}
          ></sc-tab>
        </div>
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
