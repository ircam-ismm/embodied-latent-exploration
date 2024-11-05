import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig } from '@soundworks/helpers/node.js';

import '../utils/catch-unhandled-errors.js';

import { Server as CoMoteServer } from '../../../src/server.js';
import * as CoMoteQRCode from '../../../src/qrcode.js';
import { getWifiInfos } from '../../../src/wifi-infos.js';

import globalSchema from './schemas/global.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

const server = new Server(config);
server.useDefaultApplicationTemplate();

server.stateManager.registerSchema('global', globalSchema);

await server.start();

const wifiInfos = await getWifiInfos();
const comoteConfig = {
  id: 0,
  interval: 20, // period in ms
  ws: {
    port: 8901,
    hostname: wifiInfos.ip,
    autostart: true,
  },
  osc: null,
  webview: `http://${wifiInfos.ip}:${config.env.port}/webview`,
  // test raw HTML
  // webview: `<button style="width: 500px; height: 300px;" comote-key="coucou-1" comote-touchstart="1" comote-touchend="0">Coucou</button>`
};

const comoteServer = new CoMoteServer(comoteConfig, { verbose: false });
await comoteServer.start();

// -----------------------------------------------------------
console.log('+ CoMote link:', CoMoteQRCode.rawLink(comoteConfig));
console.log('');
console.log(await CoMoteQRCode.terminal(comoteConfig));

const global = await server.stateManager.create('global', {
  wifiInfos,
  comoteConfig,
});

comoteServer.addWsListener(data => global.set({ data }));
